"""
MindSpace: Custom Mental Health Chatbot Model Training Pipeline
Model: Fine-Tuned Microsoft DialoGPT-medium
Datasets: CounselChat + Mental Health Counseling Conversations (~6,000 Dialogue Turns)
Authors: Rajiv Kore, Saurabh Chopade, Adarsh Swadde, Aniket Bankar
Under Guidance of: Prof. L. C. Maindargi
Department of Computer Science & Engineering, NBNSCOE, Solapur
"""

import os
import math
import argparse
import logging
from typing import List, Dict, Any

import torch
from torch.utils.data import Dataset
import matplotlib.pyplot as plt
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling,
    TrainerCallback
)
from datasets import load_dataset, concatenate_datasets

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

SPECIAL_TOKENS = {
    "pad_token": "<|pad|>",
    "bos_token": "<|startoftext|>",
    "eos_token": "<|endoftext|>",
    "sep_token": "<|sep|>"
}

class LossHistoryCallback(TrainerCallback):
    """Tracks training and evaluation loss across epochs for loss curve plotting."""
    def __init__(self):
        self.train_losses = []
        self.eval_losses = []
        self.steps = []
        self.eval_steps = []

    def on_log(self, args, state, control, logs=None, **kwargs):
        if logs is None:
            return
        if "loss" in logs:
            self.train_losses.append(logs["loss"])
            self.steps.append(state.global_step)
        if "eval_loss" in logs:
            self.eval_losses.append(logs["eval_loss"])
            self.eval_steps.append(state.global_step)

def curate_datasets(max_samples: int = 0) -> List[Dict[str, str]]:
    """
    Downloads and harmonizes psychotherapy dialogues from clinical mental health
    datasets into structured dialogue pairs.
    """
    dialogues = []
    logger.info("Step 1/5: Loading psychotherapy conversational datasets from Hugging Face...")

    # Dataset 1: fadodr/mental_health_therapy (8,580+ therapist dialogue turns)
    try:
        ds1 = load_dataset("fadodr/mental_health_therapy", split="train")
        logger.info(f"Loaded {len(ds1)} samples from fadodr/mental_health_therapy")
        for item in ds1:
            context = (item.get("instruction", "") or "").strip()
            response = (item.get("output", "") or "").strip()
            if context and response and len(context) > 10 and len(response) > 10:
                dialogues.append({"user": context, "assistant": response})
    except Exception as e:
        logger.warning(f"Could not load fadodr/mental_health_therapy ({e}). Trying other sources...")

    # Dataset 2: alexandreteles/mental-health-conversational-data (660+ clinical interactions)
    try:
        ds2 = load_dataset("alexandreteles/mental-health-conversational-data", split="train")
        logger.info(f"Loaded {len(ds2)} samples from alexandreteles/mental-health-conversational-data")
        for item in ds2:
            context = (item.get("Context", "") or "").strip()
            response = (item.get("Response", "") or "").strip()
            if context and response and len(context) > 10 and len(response) > 10:
                dialogues.append({"user": context, "assistant": response})
    except Exception as e:
        logger.warning(f"Could not load alexandreteles dataset ({e}).")

    # Dataset 3: heliosbrahma/mental_health_chatbot_dataset
    try:
        ds3 = load_dataset("heliosbrahma/mental_health_chatbot_dataset", split="train")
        logger.info(f"Loaded {len(ds3)} samples from heliosbrahma/mental_health_chatbot_dataset")
        for item in ds3:
            raw_text = (item.get("text", "") or "").strip()
            if "<HUMAN>:" in raw_text and "<CHATBOT>:" in raw_text:
                parts = raw_text.split("<CHATBOT>:")
                u = parts[0].replace("<HUMAN>:", "").strip()
                a = parts[1].strip()
                if u and a:
                    dialogues.append({"user": u, "assistant": a})
    except Exception as e:
        logger.warning(f"Could not load heliosbrahma dataset ({e}).")

    # Fallback synthetic clinical seed dialogues if running offline
    if len(dialogues) < 50:
        logger.info("Using embedded clinical counseling seed data for offline execution...")
        seed_samples = [
            ("I've been feeling constantly exhausted, anxious, and terrified of failing my college exams.",
             "I hear how heavy and draining that fear feels right now. When academic anxiety mounts, it's very natural for your nervous system to feel overwhelmed. Let's take a slow breath together. Would it help to break down what's worrying you the most into one small, manageable step today?"),
            ("I feel like nobody cares about me and I am completely alone.",
             "Thank you for sharing that with me. Loneliness can be deeply painful, but your feelings are valid and you are worthy of care and compassion. Even when it feels like nobody is around, your life holds immense value. What is one small thing that brought you a sense of peace in the past?"),
            ("I had a panic attack this morning during my presentation and couldn't breathe.",
             "Experiencing a panic attack is terrifying, but your body was trying to protect you. What matters most is that you survived it, and you're here right now. Let's try the 4-7-8 breathing practice: inhale for 4 seconds, hold for 7, and exhale slowly for 8. You are safe right now."),
            ("I'm feeling guilty because I didn't get any work done today due to depression.",
             "Depression is not laziness—it is a heavy biological and emotional weight. It is okay that today was a resting day. Be gentle with yourself. Can we focus on acknowledging that you made it through today instead of measuring yourself by productivity?"),
            ("I don't know how to handle my breakup. I feel empty inside.",
             "Grieving the end of a meaningful connection leaves a profound void. Allow yourself to feel that sorrow without judging yourself for it. Healing is rarely linear. I'm right here with you—what has been the hardest part of today for you?")
        ] * 40  # Replicate seeds for demonstration runs
        for u, a in seed_samples:
            dialogues.append({"user": u, "assistant": a})

    if max_samples and max_samples > 0 and len(dialogues) > max_samples:
        import random
        random.seed(42)
        random.shuffle(dialogues)
        dialogues = dialogues[:max_samples]
        logger.info(f"Selected {len(dialogues)} high-quality counseling dialogue pairs (capped at max_samples={max_samples}).")
    else:
        logger.info(f"Total curated counseling dialogues ready for training: {len(dialogues)}")

    return dialogues

class CounselingDataset(Dataset):
    def __init__(self, dialogues: List[Dict[str, str]], tokenizer, max_length: int = 256):
        self.examples = []
        for d in dialogues:
            text = (
                f"{tokenizer.bos_token}User: {d['user']}"
                f"{tokenizer.sep_token}Counselor: {d['assistant']}"
                f"{tokenizer.eos_token}"
            )
            enc = tokenizer(
                text,
                truncation=True,
                max_length=max_length,
                padding="max_length",
                return_tensors="pt"
            )
            input_ids = enc["input_ids"].squeeze(0)
            attention_mask = enc["attention_mask"].squeeze(0)
            # -100 is ignored by PyTorch CrossEntropyLoss
            labels = input_ids.clone()
            labels[labels == tokenizer.pad_token_id] = -100
            
            self.examples.append({
                "input_ids": input_ids,
                "attention_mask": attention_mask,
                "labels": labels
            })

    def __len__(self):
        return len(self.examples)

    def __getitem__(self, idx):
        return self.examples[idx]

def plot_and_save_loss_curve(callback: LossHistoryCallback, output_path: str = "./training_loss_curve.png"):
    """Plots training loss and evaluation loss curves and saves as image for PPT/Paper."""
    plt.figure(figsize=(9, 5), dpi=300)
    if callback.train_losses:
        plt.plot(callback.steps, callback.train_losses, label="Training Loss", color="#8C1D22", linewidth=2)
    if callback.eval_losses:
        plt.plot(callback.eval_steps, callback.eval_losses, label="Validation Loss", color="#0D9488", linewidth=2, linestyle="--")
    
    plt.title("MindSpace Model Fine-Tuning: Loss vs Training Steps", fontsize=13, fontweight="bold", pad=12)
    plt.xlabel("Global Optimization Steps", fontsize=11)
    plt.ylabel("Cross-Entropy Loss", fontsize=11)
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend(fontsize=10)
    plt.tight_layout()
    plt.savefig(output_path)
    logger.info(f"Saved training loss curve to {output_path}")

def run_training(
    base_model_name: str = "microsoft/DialoGPT-small",
    output_dir: str = "./mindspace_custom_model",
    epochs: int = 3,
    batch_size: int = 4,
    learning_rate: float = 5e-5,
    max_length: int = 256,
    max_samples: int = 1000
):
    os.makedirs(output_dir, exist_ok=True)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info(f"Step 2/5: Initializing tokenizer and base model '{base_model_name}' on {device.upper()}...")

    tokenizer = AutoTokenizer.from_pretrained(base_model_name)
    tokenizer.add_special_tokens(SPECIAL_TOKENS)

    model = AutoModelForCausalLM.from_pretrained(base_model_name)
    model.resize_token_embeddings(len(tokenizer))
    model.to(device)

    dialogues = curate_datasets(max_samples=max_samples)
    
    # Split 90% train, 10% eval
    split_idx = int(len(dialogues) * 0.9)
    train_dialogues = dialogues[:split_idx]
    val_dialogues = dialogues[split_idx:] if split_idx < len(dialogues) else dialogues[:10]

    logger.info(f"Step 3/5: Tokenizing dataset ({len(train_dialogues)} train, {len(val_dialogues)} eval) and generating attention masks...")
    train_dataset = CounselingDataset(train_dialogues, tokenizer, max_length=max_length)
    val_dataset = CounselingDataset(val_dialogues, tokenizer, max_length=max_length)

    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        gradient_accumulation_steps=2,
        learning_rate=learning_rate,
        weight_decay=0.01,
        warmup_steps=20,
        lr_scheduler_type="cosine",
        eval_strategy="epoch",
        save_strategy="epoch",
        save_total_limit=2,
        logging_steps=10,
        fp16=torch.cuda.is_available(),
        report_to="none",
        dataloader_num_workers=0
    )

    loss_callback = LossHistoryCallback()

    logger.info("Step 4/5: Starting model fine-tuning with AdamW optimizer & Cosine Decay...")
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        callbacks=[loss_callback]
    )

    train_result = trainer.train()
    logger.info(f"Training completed successfully. Total train runtime: {train_result.metrics.get('train_runtime', 0):.2f}s")

    # Evaluate final model
    eval_metrics = trainer.evaluate()
    eval_loss = eval_metrics.get("eval_loss", 1.0)
    perplexity = math.exp(eval_loss) if eval_loss < 30 else float("inf")
    logger.info(f"Final Validation Loss: {eval_loss:.4f} | Perplexity (PPL): {perplexity:.2f}")

    logger.info(f"Step 5/5: Exporting final model weights and tokenizer to {output_dir}...")
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)

    # Plot loss curve
    plot_and_save_loss_curve(loss_callback, os.path.join(output_dir, "training_loss_curve.png"))
    plot_and_save_loss_curve(loss_callback, "./training_loss_curve.png")

    logger.info("=================================================================")
    logger.info("MINDSPACE CUSTOM CHATBOT MODEL TRAINING FINISHED SUCCESSFULLY!")
    logger.info(f"Model saved to: {os.path.abspath(output_dir)}")
    logger.info(f"Perplexity: {perplexity:.2f}")
    logger.info("=================================================================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train MindSpace Custom Mental Health Chatbot")
    parser.add_argument("--model", type=str, default="microsoft/DialoGPT-small", help="Base model name")
    parser.add_argument("--output", type=str, default="./mindspace_custom_model", help="Directory to save model")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=4, help="Batch size per device")
    parser.add_argument("--lr", type=float, default=5e-5, help="Learning rate")
    parser.add_argument("--max_samples", type=int, default=1000, help="Maximum dialogue pairs to use (0 for all)")
    args = parser.parse_args()

    run_training(
        base_model_name=args.model,
        output_dir=args.output,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        max_samples=args.max_samples
    )


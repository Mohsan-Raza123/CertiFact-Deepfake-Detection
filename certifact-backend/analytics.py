import torch
import numpy as np
from transformers import GPT2LMHeadModel, GPT2TokenizerFast

# Load a tiny model specifically for the Math (Formula) part
# We use 'distilgpt2' because it is fast and uses very little RAM
model_id = "distilgpt2"
model = GPT2LMHeadModel.from_pretrained(model_id)
tokenizer = GPT2TokenizerFast.from_pretrained(model_id)

def calculate_perplexity_burstiness(text):
    """
    Calculates Perplexity (Complexity) and Burstiness (Variation) 
    of a given text.
    """
    # 1. Split text into sentences (Rough split by .)
    sentences = [s.strip() for s in text.split('.') if len(s) > 10]
    
    if len(sentences) < 2:
        return 0, 0 

    perplexities = []
    
    # 2. Calculate Perplexity for each sentence
    for sentence in sentences:
        inputs = tokenizer(sentence, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs, labels=inputs["input_ids"])
            loss = outputs.loss
            perp = torch.exp(loss)
            perplexities.append(perp.item())

    # 3. The Formulas
    # Perplexity = Average "Complexity" of the text
    avg_perplexity = np.mean(perplexities)
    
    # Burstiness = Standard Deviation (How much the complexity varies)
    burstiness = np.std(perplexities)

    return avg_perplexity, burstiness
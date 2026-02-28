export const MOCK_OUTPUT = {
  problem: `This paper addresses the challenge of efficient attention mechanisms in Transformer architectures. The authors propose a novel sparse attention pattern that reduces computational complexity from O(n²) to O(n log n) while maintaining near-identical performance on downstream benchmarks including GLUE, SuperGLUE, and long-document understanding tasks.`,
  
  architecture: `The proposed model (SparseFormer) consists of:
• 12 encoder layers with sparse multi-head attention (8 heads, 512 dim)
• Local window attention (size 128) + global tokens (64 strided)
• Learned routing mechanism via lightweight MLP gate
• Pre-norm LayerNorm with residual scaling
• Feed-forward expansion ratio of 4x with GELU activation`,

  datasets: `Pre-training: C4 (750GB, filtered), Books3 (196GB), OpenWebText2 (65GB)
Fine-tuning: GLUE benchmark suite (MNLI, SST-2, QQP, QNLI, CoLA), SuperGLUE (BoolQ, CB, WiC, WSC), SCROLLS (long-doc tasks: SummScreenFD, GovReport, QMSum)`,

  hyperparameters: `Learning rate: 2e-4 (linear warmup 10k steps, cosine decay)
Batch size: 2048 (gradient accumulation × 4)
Weight decay: 0.01 | Dropout: 0.1
Optimizer: AdamW (β₁=0.9, β₂=0.999, ε=1e-8)
Training: 100k steps on 32× A100 80GB GPUs
Precision: bfloat16 mixed precision`,

  code: `import torch
import torch.nn as nn
from transformers import AutoTokenizer

class SparseAttention(nn.Module):
    def __init__(self, dim, heads=8, window_size=128, global_tokens=64):
        super().__init__()
        self.heads = heads
        self.dim_head = dim // heads
        self.window_size = window_size
        self.global_tokens = global_tokens
        self.scale = self.dim_head ** -0.5
        
        self.qkv = nn.Linear(dim, dim * 3, bias=False)
        self.proj = nn.Linear(dim, dim)
        self.gate = nn.Sequential(nn.Linear(dim, dim // 4), nn.GELU(), nn.Linear(dim // 4, 1))

    def forward(self, x, mask=None):
        B, N, C = x.shape
        qkv = self.qkv(x).chunk(3, dim=-1)
        q, k, v = map(lambda t: t.reshape(B, N, self.heads, self.dim_head).transpose(1, 2), qkv)
        
        # Local window attention
        attn = (q @ k.transpose(-2, -1)) * self.scale
        if mask is not None:
            attn = attn.masked_fill(mask == 0, -1e9)
        attn = attn.softmax(dim=-1)
        
        # Routing gate
        gate = self.gate(x).sigmoid()
        out = (attn @ v).transpose(1, 2).reshape(B, N, C)
        return self.proj(out) * gate


class SparseFormer(nn.Module):
    def __init__(self, vocab_size=50257, dim=512, depth=12, heads=8):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, dim)
        self.pos_embed = nn.Embedding(2048, dim)
        self.layers = nn.ModuleList([
            nn.ModuleList([
                SparseAttention(dim, heads),
                nn.Sequential(
                    nn.LayerNorm(dim),
                    nn.Linear(dim, dim * 4),
                    nn.GELU(),
                    nn.Linear(dim * 4, dim),
                )
            ]) for _ in range(depth)
        ])
        self.norm = nn.LayerNorm(dim)
        self.head = nn.Linear(dim, vocab_size)

    def forward(self, input_ids):
        B, T = input_ids.shape
        pos = torch.arange(T, device=input_ids.device)
        x = self.embed(input_ids) + self.pos_embed(pos)
        for attn, ff in self.layers:
            x = x + attn(x)
            x = x + ff(x)
        return self.head(self.norm(x))


# Training setup
model = SparseFormer()
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-4, weight_decay=0.01)
tokenizer = AutoTokenizer.from_pretrained("gpt2")

print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")`,

  checklist: [
    { done: true, text: "Download and preprocess C4 dataset" },
    { done: true, text: "Implement sparse attention windowing" },
    { done: false, text: "Verify local window + global token routing" },
    { done: false, text: "Run pre-training on ≥ 8 GPUs (bf16)" },
    { done: false, text: "Fine-tune on GLUE benchmark suite" },
    { done: false, text: "Evaluate on SCROLLS long-doc tasks" },
    { done: false, text: "Ablation: window size 64/128/256" },
    { done: false, text: "Compare vs. Longformer, BigBird baselines" },
  ],

  assumptions: [
    { key: "Architecture depth", confidence: 92, note: "12 layers explicitly stated" },
    { key: "Pre-training corpus", confidence: 78, note: "Inferred from related work section" },
    { key: "Learning rate schedule", confidence: 85, note: "Standard for BERT-class models" },
    { key: "Window size (128)", confidence: 70, note: "Estimated from efficiency analysis" },
    { key: "GPU count (32x A100)", confidence: 60, note: "Estimated from reported throughput" },
  ],
};

export const MOCK_EXPERIMENTS = [
  {
    id: "exp-001",
    title: "Attention Is All You Need — Reproduction",
    date: "2024-01-15",
    inputType: "PDF" as const,
    status: "complete" as const,
    description: "Full reproduction of the original transformer paper",
  },
  {
    id: "exp-002",
    title: "CLIP: Connecting Text and Images",
    date: "2024-01-22",
    inputType: "URL" as const,
    status: "running" as const,
    description: "Minimal CLIP implementation from arxiv paper",
  },
  {
    id: "exp-003",
    title: "LoRA: Low-Rank Adaptation Study",
    date: "2024-02-01",
    inputType: "Text" as const,
    status: "complete" as const,
    description: "Parameter-efficient fine-tuning experiments",
  },
  {
    id: "exp-004",
    title: "Mamba State Space Models",
    date: "2024-02-10",
    inputType: "PDF" as const,
    status: "draft" as const,
    description: "SSM architecture analysis and implementation",
  },
  {
    id: "exp-005",
    title: "Flash Attention v2 Benchmarks",
    date: "2024-02-18",
    inputType: "URL" as const,
    status: "complete" as const,
    description: "Memory-efficient attention comparison",
  },
];

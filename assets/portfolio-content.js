/* Public model references and general engineering explainers. */
window.PORTFOLIO_CONTENT = {
  "models": [
    {
      "id": "bert-base-uncased-ade-Ade-corpus-v2",
      "name": "BERT · adverse drug events",
      "year": "2021",
      "date": "19 Nov 2021",
      "task": "Classification",
      "tags": "BERT · ADE corpus v2",
      "description": "A healthcare text-classification fine-tune on the adverse drug event corpus. Repository work dates to November 2021."
    },
    {
      "id": "sagemaker-roberta-base-emotion",
      "name": "RoBERTa · emotion",
      "year": "2021",
      "date": "6 Dec 2021",
      "task": "Classification",
      "tags": "RoBERTa · SageMaker",
      "description": "Emotion classification with RoBERTa, trained on AWS SageMaker. An early example of taking a transformer through a managed training workflow."
    },
    {
      "id": "albert-base-v2-finetuned-ner",
      "name": "ALBERT · entity recognition",
      "year": "2022",
      "date": "10 Feb 2022",
      "task": "Entity recognition",
      "tags": "ALBERT · token classification",
      "description": "Named-entity recognition with ALBERT-base. A compact architecture provides a different starting point for token-level prediction."
    },
    {
      "id": "bert-large-uncased-finetuned-ner",
      "name": "BERT-large · entity recognition",
      "year": "2022",
      "date": "11 Feb 2022",
      "task": "Entity recognition",
      "tags": "BERT-large · NER",
      "description": "A BERT-large fine-tune for named-entity recognition. Part of a collection exploring pretrained encoders for practical language tasks."
    },
    {
      "id": "distilbart-cnn-12-6-finetuned-xsum",
      "name": "DistilBART · summarization",
      "year": "2022",
      "date": "31 May 2022",
      "task": "Summarization",
      "tags": "DistilBART · XSum",
      "description": "An abstractive summarization fine-tune on XSum, extending the collection from classification and extraction to sequence generation."
    },
    {
      "id": "setfit-bge-small-v1.5-sst2-50-shot",
      "name": "SetFit · 50-shot sentiment",
      "year": "2024",
      "date": "28 Mar 2024",
      "task": "Few-shot learning",
      "tags": "SetFit · BGE-small · SST-2",
      "description": "Few-shot sentiment classification with BGE-small embeddings and a classification head. The model card records 50 training examples per class."
    }
  ],
  "articles": [
    {
      "slug": "agent-evaluation",
      "category": "Agent evaluation",
      "title": "Measure the outcome. Then explain the trajectory.",
      "deck": "A practical evaluation design for single-agent and multi-agent systems: task success, repeated-run reliability, tool correctness, coordination, and the cost of a validated result.",
      "read": "7 min + evaluation workbench",
      "widget": "agent-evaluation",
      "sections": [
        [
          "01 / Define success in the world",
          "For a fictional research assistant, “sounds useful” is an incomplete success criterion. I would require an answer to the question, support for its factual claims, and compliance with the allowed actions. For an agent that changes a record, I would also check the resulting state. Record completion, unsupported claims, unauthorized changes, and timeouts separately. A valid JSON response proves only that the output can be parsed. Combine deterministic checks, task-specific rubrics, and human review where each is appropriate.",
          [
            [
              "Anthropic · Demystifying evals for AI agents",
              "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents"
            ],
            [
              "LangSmith · outcome, step, and trajectory evaluation",
              "https://docs.langchain.com/langsmith/evaluation-approaches"
            ]
          ]
        ],
        [
          "02 / Distinguish one success from repeatable success",
          "τ-bench distinguishes pass@k, at least one successful attempt, from pass^k, all k attempts succeeding. Average the per-task estimates rather than raising one aggregate success rate to a power. In the workbench, k selects subsets of four recorded trials per task. For a task with three successes, pass@2 is 100% while pass^2 is 50%. This is useful for comparing search potential with consistency; it does not predict a production guarantee. Repeated trials also need controlled resets and clearly stated sampling assumptions.",
          [
            [
              "τ-bench · reliability over repeated trials",
              "https://arxiv.org/abs/2406.12045"
            ]
          ]
        ],
        [
          "03 / Make every additional agent earn its place",
          "Compare a strong single-agent baseline with the proposed team on the same held-out tasks. Include repeated sampling from the baseline and a version with the reviewer removed. Hold tools, task definitions, and stopping conditions constant, and report both quality and resource use. MultiAgentBench motivates examining milestones and coordination alongside task completion. For a document workflow, I would track evidence preserved at handoff, conflicting facts resolved, duplicate operations, and incomplete subtasks. These diagnostic rates need explicit denominators; message count alone is not collaboration quality.",
          [
            [
              "MultiAgentBench · task and coordination metrics",
              "https://aclanthology.org/2025.acl-long.421/"
            ]
          ]
        ],
        [
          "04 / Connect a failed result to inspectable evidence",
          "Retain task and dataset revisions, role and model identifiers, prompt versions, tool arguments and results, parent-span relationships, handoff payloads, retries, and the final artifact. Judge observable actions and evidence, not a claim of hidden reasoning. MAST offers a useful failure vocabulary across system specification, inter-agent alignment, and verification or termination. In my evaluation design, those labels help group failures; they do not replace an executable check of what happened. Allow different valid plans: check required invariants and ordering constraints instead of insisting on one exact tool sequence. Review apparently successful runs as well as failures.",
          [
            [
              "MAST · Why Do Multi-Agent LLM Systems Fail?",
              "https://arxiv.org/abs/2503.13657"
            ]
          ]
        ],
        [
          "05 / Evaluate the evaluator and the operating budget",
          "AgentRewardBench studies automatic evaluators against human-reviewed web-agent trajectories and finds no judge that excels everywhere. I would build a human-adjudicated calibration set, track false passes and false failures, randomize candidate order for pairwise judging, and check agreement by task slice. Freeze the evaluator before the final test. Report p50/p95 wall-clock latency, total generation and review tokens, retries, and total spend divided by validated completions, including failed attempts. Use paired comparisons and task-clustered uncertainty estimates; an average score should not conceal a critical failure category.",
          [
            [
              "AgentRewardBench · evaluating the evaluator",
              "https://arxiv.org/abs/2504.08942"
            ],
            [
              "Anthropic · Demystifying evals for AI agents",
              "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents"
            ]
          ]
        ]
      ],
      "sources": [
        [
          "τ-bench · reliability over repeated trials",
          "https://arxiv.org/abs/2406.12045"
        ],
        [
          "MultiAgentBench · task and coordination metrics",
          "https://aclanthology.org/2025.acl-long.421/"
        ],
        [
          "MAST · Why Do Multi-Agent LLM Systems Fail?",
          "https://arxiv.org/abs/2503.13657"
        ],
        [
          "AgentRewardBench · evaluating the evaluator",
          "https://arxiv.org/abs/2504.08942"
        ],
        [
          "LangSmith · outcome, step, and trajectory evaluation",
          "https://docs.langchain.com/langsmith/evaluation-approaches"
        ],
        [
          "Anthropic · Demystifying evals for AI agents",
          "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents"
        ]
      ],
      "sourceNote": "The evaluation design and all workbench records are original, synthetic teaching examples. They are not measurements of a deployed agent or an employer system. Published benchmarks support particular evaluation methods, not a universal agent score."
    },
    {
      "slug": "model-pools",
      "category": "Multi-agent research",
      "title": "A better answer in the pool is only the beginning.",
      "deck": "Reading Mo’ Models, Mo’ Problems: available correctness, selected correctness, and the selector that sits between them.",
      "read": "5 min + selection experiment",
      "widget": "model-pools",
      "sections": [
        [
          "01 / What the paper tested",
          "Marjanović and colleagues evaluate 23 models, eight pool-selection strategies, and three architectures—routing, majority voting, and LLM judging—on HLE, GPQA-Diamond, and FrontierScience–Olympiad. This September 15, 2026 preprint reports a gap between oracle potential and achieved performance: adding candidates often hurts. Same-family pools show the best relative performance against their strongest member. That is not a claim that they beat the strongest model available overall.",
          [
            [
              "Mo’ Models, Mo’ Problems · September 2026 preprint",
              "https://arxiv.org/abs/2609.17306"
            ]
          ]
        ],
        [
          "02 / Read the result within its scope",
          "The experiments exclude tool use, retrieval, and collaboration during generation, and use one judge model. They study simple selection architectures on difficult science questions. I would treat the result as a reason to test model-pool composition explicitly, rather than a general verdict about teams of agents performing different operations.",
          [
            [
              "Mo’ Models, Mo’ Problems · September 2026 preprint",
              "https://arxiv.org/abs/2609.17306"
            ]
          ]
        ],
        [
          "03 / Count recoveries and spoiled answers",
          "The invented experiment below starts with 80 correct answers out of 100. A second model supplies correct alternatives for 10 baseline misses, giving an oracle ceiling of 90%. A selector that recovers five misses but spoils eight previously correct answers finishes at 77%. The relevant arithmetic is baseline correct + recovered − spoiled. These counts describe one fixed set of candidates; they are not paper results. Change the controls and inspect every case to see exactly where the final score comes from."
        ],
        [
          "04 / Isolate the selector from the generators",
          "For my own evaluation, I would retain all candidates with reference correctness labels. Report the oracle ceiling, final accuracy, recovery rate among recoverable misses, and spoilage rate among correct baseline answers. Inspect both kinds of error. Then run the same candidate set through different selection rules. With answers 42, 17, and 17, majority voting chooses 17 even when 42 is correct. A larger candidate set is useful only if the final system can identify and use its useful contributions."
        ],
        [
          "05 / Compare complete systems on a held-out workload",
          "Start with a capable single model, repeated sampling from that model, and one carefully chosen addition. Choose prompts, pools, and selectors using development data; leave the test set untouched. Compare quality at a fixed budget and also report the quality–cost frontier. Count candidate generation, judging, retries, and wall-clock time. A planner, retriever, and reviewer can share one model, so agent count and model diversity are separate experimental variables. The aim is an observable improvement in the finished task, not a larger diagram."
        ]
      ],
      "sources": [
        [
          "Mo’ Models, Mo’ Problems · September 2026 preprint",
          "https://arxiv.org/abs/2609.17306"
        ],
        [
          "Authors’ code",
          "https://github.com/spaidataiga/mo-models"
        ],
        [
          "MultiAgentBench · task and coordination metrics",
          "https://aclanthology.org/2025.acl-long.421/"
        ]
      ],
      "sourceNote": "Paper summary checked against arXiv v1. The 100-case selection experiment is independently authored and synthetic; its numbers must not be read as benchmark or production results."
    },
    {
      "slug": "encoder-decoder",
      "category": "Model architectures",
      "title": "Encoder, decoder, or both? Start with the output.",
      "deck": "Compare attention patterns, training objectives, useful starting points, and the evaluation each language-model architecture needs.",
      "read": "6 min + architecture explorer",
      "widget": "encoder-decoder",
      "sections": [
        [
          "01 / Encoders build contextual representations",
          "A conventional bidirectional encoder lets each input position use context on both sides, subject to padding and other masks. A task head can produce a document label or one label per token. BERT is a foundational example. Encoders are useful baselines for entity recognition, classification, and retrieval representations; useful sentence embeddings still require an appropriate training objective and evaluation. The diagram shows permitted attention connections, not learned attention weights or activations.",
          [
            [
              "BERT · bidirectional representations",
              "https://arxiv.org/abs/1810.04805"
            ]
          ]
        ],
        [
          "02 / Decoders model a continuation",
          "A conventional causal decoder predicts a continuation from the prompt and the generated prefix. At a position, self-attention can access that position and earlier ones, but not future tokens. This supports open-ended generation and, after suitable training and application design, structured or tool-call outputs. An architecture alone does not supply instruction following, factual reliability, or safe tool execution. GPT-style language modeling is an example of this family; prompts and fine-tuning determine much of the behavior you actually deploy.",
          [
            [
              "Language Models are Few-Shot Learners",
              "https://arxiv.org/abs/2005.14165"
            ]
          ]
        ],
        [
          "03 / Encoder–decoders separate source and target",
          "An encoder–decoder reads the source with an encoder, then generates target tokens with a causal decoder. Cross-attention lets that decoder use the source representations. T5 frames many tasks as text-to-text transformations. Translation and summarization are natural starting points, although decoder-only models can also perform them. Compare trained checkpoints on the same data and operational constraints. Architecture is one design choice among model size, data, adaptation, decoding, and the surrounding application.",
          [
            [
              "T5 · a unified text-to-text transformer",
              "https://arxiv.org/abs/1910.10683"
            ]
          ]
        ],
        [
          "04 / Adapt the model and name the method precisely",
          "Supervised fine-tuning uses labeled examples of the target task. Domain-adaptive pretraining continues a language-model objective on domain text; task-adaptive pretraining uses unlabeled task data. These are distinct interventions. Don’t Stop Pretraining studies the latter two across classification settings. A practical experiment would compare a frozen baseline, supervised adaptation, and additional pretraining where justified, while protecting a held-out evaluation set from training leakage. LoRA changes which parameters are trained; it is not itself a domain or task objective.",
          [
            [
              "Don’t Stop Pretraining · domain and task adaptation",
              "https://arxiv.org/abs/2004.10964"
            ]
          ]
        ],
        [
          "05 / Evaluate the behavior the product depends on",
          "For NER, define entity boundaries and measure span-level precision, recall, and F1. For imbalanced classification, inspect per-class recall and precision–recall tradeoffs. For retrieval, evaluate ranked results against relevant documents. For summarization, check factual support, coverage, and usefulness; lexical overlap alone does not establish correctness. My public BERT/ALBERT fine-tunes and DistilBART summarizer provide examples of working across these model families. The Quantum Health experience reflects applied model adaptation; this explorer uses only general mechanisms and public references."
        ]
      ],
      "sources": [
        [
          "BERT · bidirectional representations",
          "https://arxiv.org/abs/1810.04805"
        ],
        [
          "T5 · a unified text-to-text transformer",
          "https://arxiv.org/abs/1910.10683"
        ],
        [
          "Language Models are Few-Shot Learners",
          "https://arxiv.org/abs/2005.14165"
        ],
        [
          "Don’t Stop Pretraining · domain and task adaptation",
          "https://arxiv.org/abs/2004.10964"
        ],
        [
          "Attention Is All You Need",
          "https://arxiv.org/abs/1706.03762"
        ],
        [
          "My public model collection",
          "https://huggingface.co/Jorgeutd"
        ]
      ],
      "sourceNote": "The diagrams are conceptual: no model weights are loaded. They show conventional attention masks, not every transformer variant. Task suggestions are starting points for evaluation, not claims that a family is always best. The adaptation explanation describes general methods, not an employer training pipeline."
    },
    {
      "slug": "system-design",
      "category": "System design",
      "title": "Start with the constraints. Make the boundaries visible.",
      "deck": "An architecture should explain who owns a decision, what happens when a dependency fails, and how the system earns the right to ship.",
      "read": "6 min + interactive diagram",
      "widget": "architecture",
      "sections": [
        [
          "01 / Frame the decision",
          "For a retrieval-augmented question-answering service, I would start with the task and its operating envelope: which sources are authoritative, how fresh the evidence must be, how quickly a response is useful, and what should happen when the evidence is missing. “Answer the question” is incomplete until the team defines unsupported claims, correction paths, and the cost of a wrong answer."
        ],
        [
          "02 / Assign ownership before services",
          "The application owns the user interaction. The workflow owns orchestration and its deadline. A business capability owns authorization and changes to its authoritative records. A model service owns execution within a documented contract. These are responsibility boundaries; they do not automatically require four independently deployed services. I would choose deployment units from coupling, operational ownership, and scaling needs."
        ],
        [
          "03 / Follow one request, then one failure",
          "The diagram below is a new, generic teaching example created for this portfolio. Follow a question through retrieval, context assembly, generation, validation, and response. Switch between a normal path, missing evidence, and an exhausted deadline. It illustrates broadly applicable design questions and does not depict an employer system."
        ],
        [
          "04 / Make the operating limits explicit",
          "I would place a deadline on the whole operation and a smaller budget on each dependency. Retries need a bounded attempt count, jitter, and an idempotency strategy for side effects. A saturated dependency should not produce an unlimited queue of work. Admission control and a clear degraded response can protect the useful work already in flight."
        ],
        [
          "05 / Record the alternative and the test",
          "A useful design record includes the rejected option and the evidence that would change the decision. For example: start with a single retrieval stage, evaluate whether reranking improves the task, and record its additional latency and cost. Validate the design using a versioned question set, dependency fault injection, and realistic input lengths. A clean diagram is the beginning of the review, not proof of reliability."
        ]
      ],
      "sources": [
        [
          "Interactive storage explanation · OpenAI",
          "https://openai.com/index/scaling-storage-one-billion-users-part-one/"
        ],
        [
          "Handling Overload · Google SRE",
          "https://sre.google/sre-book/handling-overload/"
        ]
      ],
      "sourceNote": "Interaction reference: OpenAI uses animated figures to explain storage behavior. This portfolio uses a separately authored, generic retrieval example with illustrative timing and no employer-specific architecture."
    },
    {
      "slug": "tracing",
      "category": "Observability & agents",
      "title": "A trace should explain the execution.",
      "deck": "Designing an evidence workbench around run identity, causal structure, and feedback that can be inspected later.",
      "read": "7 min + trace explorer",
      "widget": "trace",
      "sections": [
        [
          "01 / Name the things precisely",
          "LangSmith documents a run as an individual operation, a trace as the tree of runs for one execution, and a thread as a collection of related traces across a conversation. That distinction matters: one answer may involve retrieval, several model calls, tools, and validation. A single total duration cannot explain where the time went or which dependency supplied a disputed fact."
        ],
        [
          "02 / Capture a useful execution record",
          "In a workbench I would build, every span would carry a trace ID, span ID, optional parent ID, operation name, start and end timestamps, status, and versioned attributes. Model and prompt identities belong alongside tool and retrieval metadata. Inputs and outputs require deliberate redaction and retention policies. Large payloads can live in a separate object store behind authorized references."
        ],
        [
          "03 / Keep collection off the critical path",
          "My proposed design separates execution from telemetry ingestion: bounded in-process buffers feed an authenticated collector, which validates tenant identity and schema before a durable queue. Workers materialize searchable trace metadata while retaining an immutable event record. Export failures should be observable, but a slow analytics store should not indefinitely block the user request. Dropped events need counters so an incomplete trace cannot silently look complete."
        ],
        [
          "04 / Build the read experience around questions",
          "Start with “what happened?” and “what changed?”. A tree exposes parent-child relationships; a timeline exposes overlap and waiting. Selecting a span should reveal its input, output, version, and status together. The explorer below uses deliberately small synthetic traces. The slow-tool and retry scenarios illustrate different failure shapes, not production performance measurements."
        ],
        [
          "05 / Connect feedback without rewriting history",
          "Evaluation feedback should reference the run it judged and preserve evaluator version, rubric, dataset revision, and reviewer identity where appropriate. Human review and automated scores are different evidence. A failed case can become a curated offline example after redaction and deduplication. This creates a learning loop without assuming that every production interaction is suitable training data."
        ]
      ],
      "sources": [
        [
          "Runs, traces, threads & feedback · LangSmith",
          "https://docs.langchain.com/langsmith/observability-concepts"
        ],
        [
          "Viewing traces · LangSmith",
          "https://docs.langchain.com/langsmith/view-traces"
        ],
        [
          "Dapper · Google Research",
          "https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/"
        ]
      ],
      "sourceNote": "The terminology is grounded in public documentation. The collector, queue, storage, and review design is an original proposal, not a description of LangSmith’s private implementation."
    },
    {
      "slug": "evaluation",
      "category": "Evaluation",
      "title": "A score needs a chain of evidence.",
      "deck": "Separate model behavior, decision policy, and release judgment. Then make the cost of each mistake visible.",
      "read": "6 min + threshold experiment",
      "widget": "evaluation",
      "sections": [
        [
          "01 / Start with an error taxonomy",
          "Before choosing a metric, define the mistakes that matter: missed intent, false routing, unsupported claims, malformed output, unsafe tool arguments, and an unanswered request. Each belongs to a different layer of the system. A classifier’s confusion matrix and an agent’s task-completion rubric answer different questions."
        ],
        [
          "02 / Keep development and release evidence separate",
          "I would version an offline dataset with a documented origin, labeling process, and split strategy. Repeatedly tuning on the final test set turns it into development data. Slice results by input length, language, ambiguity, and operationally important cohorts. Keep an untouched release set where feasible, and record uncertainty when a slice is small."
        ],
        [
          "03 / A threshold is a policy choice",
          "A score becomes an action only after a decision rule is applied. Raising a positive-class threshold typically trades fewer positive predictions for more missed positives on a fixed set. The experiment below computes the exact confusion matrix for twelve invented examples. These values demonstrate the mechanics; they do not measure a deployed model, and the scores are not calibrated probabilities."
        ],
        [
          "04 / Use judges as measured instruments",
          "An LLM judge needs a specific rubric, pinned configuration, and comparison against human judgments. Inspect disagreements, position effects, and sensitivity to irrelevant wording. Reference-free evaluation can accelerate feedback, but a fluent explanation from a judge is not an independent guarantee of correctness. For retrieval applications, evaluate context selection and answer grounding separately."
        ],
        [
          "05 / Close the loop with production evidence",
          "LangSmith distinguishes offline evaluation on datasets from online evaluation of running applications. I would use curated offline cases for repeatable comparisons and sampled production traces to find new failure modes. Monitor drift, review the failures, then deliberately promote useful cases into the offline collection. Release decisions should consider quality, latency, reliability, and cost together."
        ]
      ],
      "sources": [
        [
          "Offline and online evaluation · LangSmith",
          "https://docs.langchain.com/langsmith/evaluation-types"
        ],
        [
          "HELM · Liang et al.",
          "https://arxiv.org/abs/2211.09110"
        ],
        [
          "Ragas · Es et al.",
          "https://arxiv.org/abs/2309.15217"
        ]
      ],
      "sourceNote": "The threshold experiment uses a fixed synthetic dataset. It is a worked example, not reported model performance."
    },
    {
      "slug": "inference",
      "category": "Inference systems",
      "title": "The cache is part of the architecture.",
      "deck": "Use memory accounting to narrow the design space, then measure the serving system under a workload that resembles the product.",
      "read": "5 min + memory lab",
      "widget": "memory-link",
      "sections": [
        [
          "01 / Count the payload before discussing fit",
          "For a conventional full-attention decoder with equally sized sequences, KV-cache payload is 2 × layers × KV heads × head dimension × cached tokens × sequences × bytes per value. The factor of two accounts for keys and values. A 32-layer example with 32 KV heads, head dimension 128, 4,096 tokens, one sequence, and two-byte values produces 2 GiB of cache payload."
        ],
        [
          "02 / Explain what sharing changes",
          "Holding the other terms constant, using eight KV heads produces 512 MiB, while one KV head produces 64 MiB. Those are accounting results, not measured speedups or quality guarantees. Head-sharing strategies depend on the trained architecture. A website slider cannot turn an arbitrary multi-head model into a grouped-query model without changing the model."
        ],
        [
          "03 / Add the rest of the memory budget",
          "Weights, temporary activations, kernels, allocator behavior, padding, and runtime overhead all consume memory. Quantized formats may include scales and metadata. Sliding-window, hybrid, and latent-attention architectures need different accounting. On a device, the model shares memory and power constraints with the application, so a cache estimate alone cannot establish that a workload fits."
        ],
        [
          "04 / Measure prefill, decode, and queueing separately",
          "I would benchmark time to first token, inter-token latency, completion latency, throughput, and failures across a workload grid. Input length, output length, concurrency, warmup, hardware, runtime revision, and sampling settings need to be recorded. The same model can feel fast in a single short demo and fail a longer concurrent workload."
        ],
        [
          "05 / Choose an optimization for the bottleneck",
          "PagedAttention addresses KV-cache management in serving. FlashAttention focuses on attention computation and memory access; FlashAttention-3 targets Hopper GPUs. These techniques operate at different layers. I would first establish whether the limiting factor is capacity, bandwidth, compute, or queueing, then compare a controlled change against the baseline."
        ]
      ],
      "sources": [
        [
          "PagedAttention · Kwon et al.",
          "https://arxiv.org/abs/2309.06180"
        ],
        [
          "FlashAttention-3 · Shah et al.",
          "https://arxiv.org/abs/2407.08608"
        ]
      ],
      "sourceNote": "The numbers above are calculated examples. The linked lab exposes the assumptions and excludes non-cache memory."
    },
    {
      "slug": "model-mechanics",
      "category": "Model mechanics",
      "title": "From logits to the next token.",
      "deck": "Temperature and filtering change a distribution. They do not add knowledge to the model.",
      "read": "5 min + sampling experiment",
      "widget": "sampling",
      "sections": [
        [
          "01 / Follow the representation",
          "A tokenizer maps text to IDs. Embeddings produce vectors. Transformer blocks update representations using attention and feed-forward transformations. In an autoregressive decoder, causal masking limits which positions can contribute to a prediction. The output head then maps a representation to vocabulary logits. The six-block drawing in Research & Labs illustrates this path without claiming to show a trained model’s activations."
        ],
        [
          "02 / Turn scores into a distribution",
          "For positive temperature T, softmax uses exp(logit / T) and normalizes the result. The implementation below subtracts the maximum scaled logit for numerical stability. Lower temperature concentrates probability on higher-scoring candidates; higher temperature spreads it more evenly. Greedy decoding is a separate argmax rule, so this control deliberately excludes T = 0."
        ],
        [
          "03 / Make the filtering order explicit",
          "In this experiment, temperature is applied first, then top-k retains the highest-scoring candidates, then top-p retains the smallest leading set reaching the requested cumulative mass. Each filtering step renormalizes before the next. Implementations can differ in order and edge handling, so a reproducible generation record must identify the actual sampler."
        ],
        [
          "04 / Position is an architectural choice",
          "The original Transformer used sinusoidal positional encodings. RoPE instead applies position-dependent rotations to query and key representations. These mechanisms should be explained in terms of their actual operations, not treated as interchangeable decorations on an embedding. The paper shelf links both the original architecture and the rotary-position work."
        ],
        [
          "05 / Know what the experiment establishes",
          "The bars below are computed from six invented logits. Changing the controls demonstrates probability transformations exactly for that toy vocabulary. It does not test factuality, reasoning, or a released model. To study a real model, pin the tokenizer and weights, record the full prompt and runtime settings, and compare generated behavior across repeated samples."
        ]
      ],
      "sources": [
        [
          "Attention Is All You Need · Vaswani et al.",
          "https://arxiv.org/abs/1706.03762"
        ],
        [
          "RoFormer / RoPE · Su et al.",
          "https://arxiv.org/abs/2104.09864"
        ]
      ],
      "sourceNote": "An exact computation over a toy vocabulary. No model inference or live logits are presented."
    },
    {
      "slug": "release",
      "category": "Release engineering",
      "title": "A release is a reproducible decision.",
      "deck": "Connect the model artifact, the application contract, and the evidence that justified promotion.",
      "read": "5 min",
      "widget": "release",
      "sections": [
        [
          "01 / Define the candidate as a bundle",
          "The candidate is more than a weights file. I would identify model and tokenizer revisions, prompt or template version, quantization and runtime settings, tool schemas, preprocessing, decision thresholds, and application code. A release manifest ties those artifacts to the dataset and evaluator versions used to assess them."
        ],
        [
          "02 / Gate the behavior the product depends on",
          "A gate should state its population, metric, threshold, and owner. Structured-output validity, task quality, tool authorization, latency, and device resource use may all matter. Some failures are hard blockers; others require a documented tradeoff. A passing aggregate score should not hide a regression in an important slice."
        ],
        [
          "03 / Test the deployed form",
          "A development checkpoint, a quantized artifact, and a mobile package are different execution forms. I would validate the exact artifact in the intended runtime and device envelope, including long inputs, cold starts, resource pressure, and interrupted operations. Each model version, threshold, and runtime needs its own evidence; qualification should not transfer automatically between them."
        ],
        [
          "04 / Keep rollout reversible",
          "Promotion should retain the previous known-good bundle and a rollback path that is tested before it is needed. For a staged rollout, define the exposure step and observation window in advance. A model rollback is incomplete if the associated prompt, schema, or preprocessing no longer matches the restored artifact."
        ],
        [
          "05 / Preserve the reasoning",
          "Store the comparison, known limitations, reviewer decision, and operational observations alongside the manifest. Later, an unexpected trace can be tied to the exact candidate that ran. The goal is a team that can explain and reproduce a decision, rather than a dashboard that only remembers the latest green number."
        ]
      ],
      "sources": [
        [
          "Evaluation concepts · LangSmith",
          "https://docs.langchain.com/langsmith/evaluation"
        ],
        [
          "Handling Overload · Google SRE",
          "https://sre.google/sre-book/handling-overload/"
        ]
      ],
      "sourceNote": "A general release method. No internal application, production qualification, or employer release record is disclosed."
    }
  ],
  "papers": [
    [
      "Agents",
      "Mo’ Models, Mo’ Problems: How to best select model pools when designing Multi-Agent Systems",
      "2026 · preprint",
      "Larger candidate pools can lose accuracy at selection time. Separate oracle potential from the result the system actually returns.",
      "https://arxiv.org/abs/2609.17306",
      "model-pools"
    ],
    [
      "Agents",
      "τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains",
      "2024",
      "Final-state evaluation and pass^k make repeated-run reliability visible alongside occasional success.",
      "https://arxiv.org/abs/2406.12045",
      "agent-evaluation"
    ],
    [
      "Agents",
      "MultiAgentBench: Evaluating the Collaboration and Competition of LLM agents",
      "2025 · ACL",
      "Task completion, milestone progress, and coordination metrics across collaborative and competitive scenarios.",
      "https://aclanthology.org/2025.acl-long.421/",
      "agent-evaluation"
    ],
    [
      "Agents",
      "Why Do Multi-Agent LLM Systems Fail?",
      "2025",
      "MAST organizes failures in specification, alignment between agents, and verification or termination.",
      "https://arxiv.org/abs/2503.13657",
      "agent-evaluation"
    ],
    [
      "Evaluation",
      "AgentRewardBench: Evaluating Automatic Evaluations of Web Agent Trajectories",
      "2025",
      "Human-reviewed trajectories provide a way to check whether automatic evaluators recognize agent success and failure.",
      "https://arxiv.org/abs/2504.08942",
      "agent-evaluation"
    ],
    [
      "Foundations",
      "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
      "2018",
      "Bidirectional input representations as a foundation for classification and token-level prediction.",
      "https://arxiv.org/abs/1810.04805",
      "encoder-decoder"
    ],
    [
      "Foundations",
      "Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer",
      "2019",
      "T5 provides an encoder–decoder foundation for expressing language tasks as text-to-text transformations.",
      "https://arxiv.org/abs/1910.10683",
      "encoder-decoder"
    ],
    [
      "Foundations",
      "Language Models are Few-Shot Learners",
      "2020",
      "Autoregressive language modeling and task demonstrations: a foundation for understanding decoder-based systems.",
      "https://arxiv.org/abs/2005.14165",
      "encoder-decoder"
    ],
    [
      "Adaptation",
      "Don’t Stop Pretraining: Adapt Language Models to Domains and Tasks",
      "2020 · ACL",
      "Continued pretraining on domain and task text is a distinct intervention from supervised fine-tuning.",
      "https://arxiv.org/abs/2004.10964",
      "encoder-decoder"
    ],
    [
      "Foundations",
      "Attention Is All You Need",
      "2017",
      "Attention replaces recurrence in the original Transformer. Start with scaled dot-product attention, then follow how representations move through a block.",
      "https://arxiv.org/abs/1706.03762",
      "model-mechanics"
    ],
    [
      "Foundations",
      "RoFormer / rotary position embeddings",
      "2021",
      "Position-dependent rotations of queries and keys provide a concrete alternative to adding sinusoidal position vectors.",
      "https://arxiv.org/abs/2104.09864",
      "model-mechanics"
    ],
    [
      "Inference",
      "FlashAttention",
      "2022",
      "An IO-aware exact attention algorithm. Read it as a study in moving less data between levels of GPU memory.",
      "https://arxiv.org/abs/2205.14135",
      "inference"
    ],
    [
      "Inference",
      "PagedAttention",
      "2023",
      "KV-cache management for serving. Separate the memory-allocation mechanism from claims about any specific deployment.",
      "https://arxiv.org/abs/2309.06180",
      "inference"
    ],
    [
      "Inference",
      "FlashAttention-3",
      "2024",
      "Attention optimization for Hopper GPUs. Hardware-specific assumptions belong in the explanation and benchmark record.",
      "https://arxiv.org/abs/2407.08608",
      "inference"
    ],
    [
      "Inference",
      "Fast Inference from Transformers via Speculative Decoding",
      "2022",
      "A draft-and-verify decoding approach. The acceptance mechanism is essential to understanding its distributional guarantees.",
      "https://arxiv.org/abs/2211.17192",
      "inference"
    ],
    [
      "Adaptation",
      "LoRA",
      "2021",
      "Low-rank updates reduce the trainable adaptation state. Distinguish trainable parameters from total model memory.",
      "https://arxiv.org/abs/2106.09685",
      "release"
    ],
    [
      "Adaptation",
      "QLoRA",
      "2023",
      "Fine-tuning through a quantized base model with low-rank adapters. Training efficiency and serving performance are separate questions.",
      "https://arxiv.org/abs/2305.14314",
      "release"
    ],
    [
      "Evaluation",
      "HELM",
      "2022",
      "A multi-scenario, multi-metric evaluation framework. Its useful design lesson is to make coverage and tradeoffs visible.",
      "https://arxiv.org/abs/2211.09110",
      "evaluation"
    ],
    [
      "Evaluation",
      "Ragas",
      "2023",
      "Evaluation of retrieval-augmented generation across retrieval and generation dimensions. Automated judgments still need task-specific validation.",
      "https://arxiv.org/abs/2309.15217",
      "evaluation"
    ],
    [
      "Systems",
      "Dapper",
      "2010",
      "Google’s distributed tracing paper. Trace structure and propagation turn independent events into an execution narrative.",
      "https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/",
      "tracing"
    ],
    [
      "Systems",
      "Handling Overload · engineering guide",
      "Google SRE",
      "Queueing, capacity, and overload behavior deserve first-class design decisions. This is an engineering chapter, not a research paper.",
      "https://sre.google/sre-book/handling-overload/",
      "system-design"
    ]
  ]
};

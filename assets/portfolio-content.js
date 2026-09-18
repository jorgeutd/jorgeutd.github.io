/* Public model references and original engineering explainers. */
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
      "slug": "inference-topology",
      "category": "Inference / architecture",
      "title": "Make inference capacity earn its cost.",
      "deck": "Match the serving architecture to the workload. Measure queueing, first-token latency, and the completed response before adding another service.",
      "read": "3 min · September 2026",
      "widget": "inference-topology",
      "sections": [
        [
          "01 / The delivery decision",
          "An AI feature needs a latency target, a quality threshold and a capacity budget. My starting point is the complete request: input processing, model execution, waiting and response delivery. I would compare architectures against the same workload and resource envelope, then check whether the added operational complexity earns its place."
        ],
        [
          "02 / A current engineering example",
          "NVIDIA’s September 2026 article separates vision encoding from LLM prefill/decode workers. Independent queues can keep text requests from waiting behind image processing. Encoder workers can share GPUs or use a separate hardware tier. The useful lesson is conditional: transfer overhead, output length and hardware placement determine whether the split helps.",
          [
            [
              "NVIDIA · engineering article · 9 September 2026",
              "https://developer.nvidia.com/blog/when-to-use-encode-prefill-decode-disaggregation-to-accelerate-multimodal-model-serving/"
            ]
          ]
        ],
        [
          "03 / Inspect the tradeoff",
          "The original example below compares shared workers with a dedicated encoder pool under the same total GPU count. Change image load, response length or arrival rate. Inspect the same request in both layouts. Each number is computed from visible assumptions; the experiment illustrates queueing and capacity allocation rather than predicting a production engine."
        ],
        [
          "04 / Optimize the whole response",
          "Quantization can change the balance between stages, so I would re-profile after every model or precision change. First-token latency, inter-token latency, completed-request latency and task quality answer different questions. A faster opening token is valuable, but the response still has to finish correctly. In the example, the faster-LLM control changes service times only; it makes no quality claim."
        ],
        [
          "05 / What I would validate before release",
          "Use a representative request distribution, pinned model and runtime, warm and cold runs, bounded queues, and a clear rejection policy. Record hardware cost alongside throughput and tail latency. Test task quality after quantization. Keep the simpler layout as a baseline, and verify rollback when a topology or model version misses its operating target."
        ]
      ],
      "sources": [
        [
          "NVIDIA · When to Use Encode-Prefill-Decode Disaggregation · 9 September 2026",
          "https://developer.nvidia.com/blog/when-to-use-encode-prefill-decode-disaggregation-to-accelerate-multimodal-model-serving/"
        ],
        [
          "My public inference measurement project",
          "https://github.com/jorgeutd/llm-inference-starters"
        ]
      ],
      "sourceNote": "A compact engineering approach by Jorge Grisman, informed by a vendor-authored engineering article. The linked article reports its own hardware experiments. This portfolio’s simulator is independently authored, uses synthetic service times and does not reproduce those benchmarks. Reviewed 18 September 2026."
    },
    {
      "slug": "agent-recovery",
      "category": "Agents / production architecture",
      "title": "Keep the outcome when a worker fails.",
      "deck": "Design agent workflows around durable progress, explicit tool contracts, and evidence that explains both success and failure.",
      "read": "3 min · September 2026",
      "widget": "agent-recovery",
      "sections": [
        [
          "01 / The delivery decision",
          "A useful agent has to finish the intended task and leave a result a team can trust. I would define who owns workflow progress, which actions change external state, and how an interrupted run resumes. Those boundaries become part of the application contract, alongside the model, tools, evaluation and user experience."
        ],
        [
          "02 / A current engineering example",
          "Anthropic’s April 2026 architecture separates the orchestration loop, durable session history and tool execution environments. Workers can be replaced without treating their local memory as the source of truth. Keeping the session log outside the context window also separates recoverable history from the context selected for a particular model call.",
          [
            [
              "Anthropic · engineering article · 8 April 2026",
              "https://www.anthropic.com/engineering/managed-agents"
            ]
          ]
        ],
        [
          "03 / Test an ambiguous outcome",
          "My example focuses on one independently authored failure: a report is saved externally, then the worker disappears before recording the receipt. The next worker sees an unfinished tool intent. Retrying with the same action key is safe only when the destination implements atomic deduplication. Turn that contract off to see a duplicate write despite a completed workflow."
        ],
        [
          "04 / Make recovery inspectable",
          "Retain the logical action ID across delivery attempts, and give each attempt its own trace span. Store committed progress separately from telemetry. In a production design I would also specify leases or fencing for concurrent workers, payload-conflict checks, bounded retries, timeouts, and a reconciliation path for tools that cannot deduplicate."
        ],
        [
          "05 / Evaluate the delivered outcome",
          "I would test final task correctness, duplicate side effects, missing results, recovery delay and manual intervention. A completed trace alone cannot establish that the business outcome is correct. The interactive example makes that distinction visible: two external writes can sit behind one apparently successful response."
        ]
      ],
      "sources": [
        [
          "Anthropic · Scaling Managed Agents · 8 April 2026",
          "https://www.anthropic.com/engineering/managed-agents"
        ],
        [
          "My public tool-use evaluation project",
          "https://github.com/jorgeutd/local-agent-bench"
        ]
      ],
      "sourceNote": "A compact engineering approach by Jorge Grisman, informed by an engineering case study. The report-saving scenario, event model and idempotency experiment are original teaching examples. They do not represent an employer architecture or imply exactly-once delivery. Reviewed 18 September 2026."
    },
    {
      "slug": "graph-neural-networks",
      "category": "Graphs",
      "title": "When relationships become the model.",
      "deck": "A practical research guide to graph neural networks: message passing, architecture choices, useful applications, and the connection to LLM retrieval. Follow the mathematics in 3D, then inspect a trained public project.",
      "read": "15 min read · reviewed 18 September 2026",
      "widget": "graphs",
      "sections": [
        [
          "01 / Start with the decision",
          "A graph neural network is useful when relationships carry information that independent rows would lose. Start with a concrete target: which account needs review, which item belongs in a candidate set, which molecule has a desired property, or which documents support a question. Identify what information is available at that moment. A graph is not automatically the right representation because entities can be connected. Ask whether the links add predictive signal beyond a strong tabular, lexical or text-embedding baseline. The examples here are research designs and authored teaching fixtures, not claims about employer systems."
        ],
        [
          "02 / Three ideas that should stay separate",
          "A graph database stores and queries relationships. A graph neural network learns a representation through the graph. Graph-augmented retrieval uses connections to find or organize evidence for an answer. These can be combined, but none implies the others. A deterministic traversal can support an LLM without training a GNN. A GNN can predict a molecular property without any language model. This distinction makes the architecture easier to justify and the evaluation easier to interpret.",
          [
            [
              "G-Retriever · textual graph understanding and question answering",
              "https://arxiv.org/abs/2402.07630"
            ],
            [
              "Graph Evidence Lab · independently authored implementation",
              "https://github.com/jorgeutd/graph-evidence-lab"
            ]
          ]
        ],
        [
          "03 / The computation: send, aggregate, update",
          "Represent a graph as nodes, edges, node features and optional edge features. At layer l, each neighbor sends a message computed from its state, the receiving state and the connecting edge. A permutation-invariant aggregator combines incoming messages; an update function produces the next node state. After two local propagation layers, a node can depend on information two hops away. A node-level readout predicts a label or ranking score; a graph-level task pools node states before its readout. The 3D lab exposes this computation with four-channel vectors, exact coefficients and fixed matrices. Its spatial coordinates are a layout, not learned embeddings.",
          [
            [
              "MPNN · Neural Message Passing for Quantum Chemistry",
              "https://arxiv.org/abs/1704.01212"
            ]
          ]
        ],
        [
          "04 / Choose the operator for a reason",
          "GCN adds self loops and uses symmetric degree normalization: each incoming transformed feature is weighted by 1 / sqrt(receiver degree × sender degree). These coefficients need not sum to one. Mean GraphSAGE separates a node’s own representation from an aggregated neighborhood; sampling can bound work on large graphs. GATv2 computes attention from the receiving and sending features so the receiving node can affect neighbor ranking. Its normalized coefficients sum to one within the neighborhood. Attention is a description of a computation, not proof of causal importance. Heterogeneous graphs need relation semantics; geometric tasks may need invariant or equivariant operations. The most elaborate operator is not necessarily the best one.",
          [
            [
              "GCN · Semi-Supervised Classification with Graph Convolutional Networks",
              "https://arxiv.org/abs/1609.02907"
            ],
            [
              "GraphSAGE · Inductive Representation Learning on Large Graphs",
              "https://arxiv.org/abs/1706.02216"
            ],
            [
              "GATv2 · How Attentive are Graph Attention Networks?",
              "https://arxiv.org/abs/2105.14491"
            ]
          ]
        ],
        [
          "05 / Design the graph before training it",
          "Specify identity, edge direction, relation type, confidence, provenance and availability time. A “requires” link differs from a “measures” link; connected nodes may have complementary roles rather than matching labels. Decide how to handle isolated nodes, duplicated events and uncertain extracted relationships. Add reverse edges only after applying time cutoffs, or future evidence may flow backward into a prediction. For a live system, record both event time and the time information became available. Inspect whether a target label, a post-outcome relation or an entity identifier leaks the answer. A complicated network cannot rescue an invalid information boundary."
        ],
        [
          "06 / Four useful application patterns",
          "Fraud detection connects accounts, devices and transactions; useful evaluation includes precision–recall behavior, recall at review capacity, calibration and future-period stability. Recommendations connect users, items and interactions; candidate construction, exposure bias and cold-start slices matter as much as the chosen ranking metric. Molecules connect atoms and bonds, often with geometry; scaffold or material-family splits test a different ability from random splits. Technical retrieval connects documents, concepts and citations; measure whether graph evidence improves retrieval and the final answer under a fixed context budget. These are starting points for experiment design, not interchangeable benchmarks.",
          [
            [
              "MPNN · Neural Message Passing for Quantum Chemistry",
              "https://arxiv.org/abs/1704.01212"
            ],
            [
              "ALIGNN 2.0 · materials-oriented graph learning",
              "https://arxiv.org/abs/2609.19487"
            ],
            [
              "G-Retriever · textual graph understanding and question answering",
              "https://arxiv.org/abs/2402.07630"
            ]
          ]
        ],
        [
          "07 / How graphs and LLMs can work together",
          "There are several integration points. A language encoder can supply text features for graph nodes. A graph can retrieve a compact evidence set that is serialized into an LLM’s context. A learned graph representation can also condition a language model through an adapter or soft prompt. G-Retriever is a useful foundation for the last two ideas: it combines subgraph retrieval and graph-conditioned generation for textual graph question answering, with an available implementation. Reproducing that system requires its retrieval and language-model training setup. Passing retrieved text to an LLM is a simpler, separate design.",
          [
            [
              "G-Retriever · textual graph understanding and question answering",
              "https://arxiv.org/abs/2402.07630"
            ],
            [
              "G-Retriever · original implementation",
              "https://github.com/XiaoxinHe/G-Retriever"
            ]
          ]
        ],
        [
          "08 / A project that tests the retrieval decision",
          "Graph Evidence Lab is my independently authored implementation of query-conditioned relational message passing. It combines deterministic text features, query interactions and a lexical score, then applies two 32-channel graph updates and a document readout. Relation-specific channel gates distinguish edge types; confidence weights the neighbor aggregate. A local FastAPI service returns ranked sources, timing and provenance, or a bounded context packet for an external LLM. No hosted model is called. The project deliberately includes BM25, graph diffusion and a retrained feature-only neural baseline. Its custom MPNN is not a reproduction of G-Retriever or of the fixed-weight browser operators.",
          [
            [
              "Graph Evidence Lab · independently authored implementation",
              "https://github.com/jorgeutd/graph-evidence-lab"
            ]
          ]
        ],
        [
          "09 / Start small, keep the comparison fair",
          "Clone the repository, install the CPU runtime, run the tests, and execute the benchmark command. The original fixture contains 37 documents, 48 typed edges and 44 queries; one future document is intentionally unavailable at the evaluation cutoff. Twenty-four training queries belong to 12 groups, followed by eight validation and twelve test queries in distinct groups. Checkpoints are selected on validation NDCG@5; test judgments never construct edges or choose a checkpoint. The graph is known across splits. This evaluates held-out question intents on one authored corpus, not unseen graphs, temporal forecasting or general production capability. Replace the fixture with an authorized, independently judged corpus before drawing a stronger conclusion.",
          [
            [
              "Graph Evidence Lab · independently authored implementation",
              "https://github.com/jorgeutd/graph-evidence-lab"
            ]
          ]
        ],
        [
          "10 / Measure retrieval and answers separately",
          "Track Recall@k to identify missing evidence, NDCG@k for graded ordering, and MRR@k for the first useful item. Record the candidate set and judgment policy. If an LLM consumes the evidence, add grounded answer quality, abstention and claim-to-source support checks. Citation identifier membership alone cannot establish entailment. Keep retrieval and reader failures separate in traces. Compare accuracy, latency and context cost against simpler methods, report multiple seeds, and inspect per-query outcomes. A bootstrap over twelve authored test questions describes sensitivity to those questions; it does not manufacture an external benchmark or a production guarantee. In the first measured project run, BM25 reached 0.811 NDCG@5, graph diffusion 0.815, and the trained GNN averaged 0.776 across three seeds. The simpler baselines lead on this metric. I retain that outcome and all twelve query results rather than changing the fixture to favor the neural model.",
          [
            [
              "Measured report and protocol",
              "https://github.com/jorgeutd/graph-evidence-lab/blob/4d58cac740c55bd611f21b6511ce7c53cb779128/docs/evaluation.md"
            ]
          ]
        ],
        [
          "11 / Read this first: a practical foundation",
          "G-Retriever (NeurIPS 2024) is my starting recommendation for textual graph question answering because it connects graph retrieval to a concrete language-model workflow and provides code. Read it alongside the MPNN formulation, GraphSAGE and GATv2 to understand the mechanics. For application work, begin with the smallest baseline that can answer the question. The newest paper is useful when its assumptions match your data, not simply because its date is recent.",
          [
            [
              "G-Retriever · textual graph understanding and question answering",
              "https://arxiv.org/abs/2402.07630"
            ],
            [
              "G-Retriever · original implementation",
              "https://github.com/XiaoxinHe/G-Retriever"
            ],
            [
              "MPNN · Neural Message Passing for Quantum Chemistry",
              "https://arxiv.org/abs/1704.01212"
            ]
          ]
        ],
        [
          "12 / Recent research: useful directions, scoped claims",
          "NGM-RAG (July 2026 preprint) combines neural graph matching with other retrieval signals; its reported gains are tied to the evaluated tasks, and this review did not verify a public implementation. Chimaera (September 2026) combines GNN experts over language representations with learned selection. The full paper is accessible, but its linked code repository returned 404 during this review. ALIGNN 2.0 (September 2026 preprint) is a different, application-specific direction: atom/bond and line-graph structure for materials. These papers motivate experiments; they do not establish one universally best GNN.",
          [
            [
              "NGM-RAG · neural graph matching for retrieval",
              "https://arxiv.org/abs/2607.11159"
            ],
            [
              "Chimaera · graph experts and language representations",
              "https://arxiv.org/abs/2609.08709"
            ],
            [
              "ALIGNN 2.0 · materials-oriented graph learning",
              "https://arxiv.org/abs/2609.19487"
            ]
          ]
        ],
        [
          "13 / The recent paper that keeps the comparison honest",
          "Knowledge-Graph Based Augmentation versus RAG for Cultural QA (September 2026 preprint) directly compares graph-based and conventional retrieval. Its graph context can be compact, while conventional RAG remains competitive and is stronger in some evaluated settings. The study uses a narrow multiple-choice cultural QA setup, one reader model and benchmark-specific adaptation, so its findings should not be generalized to all knowledge work. My takeaway is an experiment design principle: measure what the graph preserves, what extraction loses, and whether a simpler retrieval method answers the question better under the same budget.",
          [
            [
              "Knowledge-Graph Based Augmentation versus RAG for Cultural QA",
              "https://arxiv.org/abs/2609.18317"
            ]
          ]
        ],
        [
          "14 / What I would build next",
          "The next useful step is an external, versioned corpus with independently judged questions. Replace hashed features with a pinned text encoder; compare a tuned dense retriever and cross-encoder; stress-test missing, corrupted and misleading edges. Evaluate new documents and time cutoffs separately. Add sampled neighborhoods only when measured graph size requires them. Then connect a reader and assess end-to-end grounding, latency and cost. Keep the numerical replay, dataset revision, model checkpoint and evaluation report together so someone else can inspect both the successful examples and the failures.",
          [
            [
              "Graph Evidence Lab · independently authored implementation",
              "https://github.com/jorgeutd/graph-evidence-lab"
            ]
          ]
        ]
      ],
      "sources": [
        [
          "MPNN · Neural Message Passing for Quantum Chemistry",
          "https://arxiv.org/abs/1704.01212"
        ],
        [
          "GCN · Semi-Supervised Classification with Graph Convolutional Networks",
          "https://arxiv.org/abs/1609.02907"
        ],
        [
          "GraphSAGE · Inductive Representation Learning on Large Graphs",
          "https://arxiv.org/abs/1706.02216"
        ],
        [
          "GATv2 · How Attentive are Graph Attention Networks?",
          "https://arxiv.org/abs/2105.14491"
        ],
        [
          "G-Retriever · textual graph understanding and question answering",
          "https://arxiv.org/abs/2402.07630"
        ],
        [
          "G-Retriever · original implementation",
          "https://github.com/XiaoxinHe/G-Retriever"
        ],
        [
          "NGM-RAG · neural graph matching for retrieval",
          "https://arxiv.org/abs/2607.11159"
        ],
        [
          "Chimaera · graph experts and language representations",
          "https://arxiv.org/abs/2609.08709"
        ],
        [
          "Knowledge-Graph Based Augmentation versus RAG for Cultural QA",
          "https://arxiv.org/abs/2609.18317"
        ],
        [
          "ALIGNN 2.0 · materials-oriented graph learning",
          "https://arxiv.org/abs/2609.19487"
        ],
        [
          "Graph Evidence Lab · independently authored implementation",
          "https://github.com/jorgeutd/graph-evidence-lab"
        ]
      ],
      "sourceNote": "Original engineering research guide by Jorge Grisman, informed by primary papers and a separately authored implementation. This is a portfolio explainer, not a peer-reviewed publication. Recent preprints are identified as such. Paper results are author-reported unless explicitly marked as a measured project run. Literature and code availability were reviewed on 18 September 2026; the selection is not an exhaustive ranking of the field."
    },
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
      "Inference",
      "When to Use Encode-Prefill-Decode Disaggregation",
      "9 Sep 2026 · engineering article",
      "When do separate encoder workers justify their transfer and scheduling overhead?",
      "https://developer.nvidia.com/blog/when-to-use-encode-prefill-decode-disaggregation-to-accelerate-multimodal-model-serving/",
      "inference-topology"
    ],
    [
      "Systems",
      "Scaling Managed Agents",
      "8 Apr 2026 · engineering article",
      "Separate recoverable session history from orchestration and execution environments.",
      "https://www.anthropic.com/engineering/managed-agents",
      "agent-recovery"
    ],
    [
      "Graphs",
      "G-Retriever",
      "NeurIPS 2024",
      "A practical foundation for textual graph QA: retrieve a subgraph and connect it to a language model. Original code is available.",
      "https://arxiv.org/abs/2402.07630",
      "graph-neural-networks"
    ],
    [
      "Graphs",
      "Graph augmentation versus RAG for Cultural QA",
      "Sep 2026 · preprint",
      "A recent comparison that makes compact graph context, retrieval quality and benchmark assumptions visible.",
      "https://arxiv.org/abs/2609.18317",
      "graph-neural-networks"
    ],
    [
      "Graphs",
      "Chimaera",
      "Sep 2026",
      "Graph experts over language representations with learned selection. Full paper reviewed; linked code was inaccessible during this review.",
      "https://arxiv.org/abs/2609.08709",
      "graph-neural-networks"
    ],
    [
      "Graphs",
      "NGM-RAG",
      "Jul 2026 · preprint",
      "Neural graph matching for retrieval. A direction to evaluate against tuned lexical and dense baselines.",
      "https://arxiv.org/abs/2607.11159",
      "graph-neural-networks"
    ],
    [
      "Graphs",
      "ALIGNN 2.0",
      "Sep 2026 · preprint",
      "Materials-oriented atom/bond and line-graph learning. An example of matching the architecture to physical structure.",
      "https://arxiv.org/abs/2609.19487",
      "graph-neural-networks"
    ],
    [
      "Graphs",
      "Neural Message Passing",
      "ICML 2017",
      "A common language for messages, aggregation, updates and graph readouts.",
      "https://arxiv.org/abs/1704.01212",
      "graph-neural-networks"
    ],
    [
      "Graphs",
      "GraphSAGE",
      "NeurIPS 2017",
      "Inductive neighborhood aggregation and sampling for large graphs.",
      "https://arxiv.org/abs/1706.02216",
      "graph-neural-networks"
    ],
    [
      "Graphs",
      "How Attentive are Graph Attention Networks?",
      "ICLR 2022",
      "The expressivity limitation of static attention and the GATv2 update.",
      "https://arxiv.org/abs/2105.14491",
      "graph-neural-networks"
    ],
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

import "https://deno.land/x/dotenv@v3.2.0/load.ts";
interface JobCreateRequest {
  prompt: string;
  params: {
    n: number;
    max_context_length: number;
    max_length: number;
    rep_pen: number;
    temperature: number;
    top_p: number;
    top_k: number;
    top_a: number;
    typical: number;
    tfs: number;
    rep_pen_range: number;
    rep_pen_slope: number;
    sampler_order: number[];
  };
  models: string[];
  workers: string[];
}

interface JobCreateResponse {
  id: string;
}

interface JobCheckResponse {
  finished: number;
  processing: number;
  restarted: number;
  waiting: number;
  done: boolean;
  faulted: false;
  wait_time: number;
  queue_position: number;
  kudos: number;
  is_possible: boolean;
}

interface JobStatusResponse extends JobCheckResponse {
  generations: {
    text: string;
    worker_id: string;
    worker_name: string;
    model: string;
  }[];
}

let requestOptions: JobCreateRequest = {
	"prompt": "",
	"params": {
		"n": 1,
		"max_context_length": 1024,
		"max_length": 80,
		"rep_pen": 1.08,
		"temperature": 0.62,
		"top_p": 0.9,
		"top_k": 0,
		"top_a": 0,
		"typical": 1,
		"tfs": 1,
		"rep_pen_range": 1024,
		"rep_pen_slope": 0.7,
		"sampler_order": [
			6,
			0,
			1,
			2,
			3,
			4,
			5
		]
	},
	"models": [],
	"workers": []
}

const baseURL = "https://koboldai.net/api/v2";
const apiKey = Deno.env.get("KOBOLD_KEY") || "0000000000";

const Headers = {
  headers: {
    "Content-Type": "application/json",
    apikey: apiKey,
  }
};

const createJob = async (text: string): Promise<JobCreateResponse> => 
  (await fetch(`${baseURL}/generate/async`, {...Headers,
    method: 'POST',
    body: JSON.stringify({
      ...requestOptions,
      prompt: text || '',
    })
  })).json();

const checkJob = async (id: string): Promise<JobCheckResponse> =>
  (await fetch(`${baseURL}/generate/check/${id}`, Headers)).json();

const getJobStatus = async (id: string): Promise<JobStatusResponse> => {
  const response = (await fetch(`${baseURL}/generate/status/${id}`, Headers));
  return response.json();
}

function UpdateRequestOptions(options: JobCreateRequest) {
  requestOptions = options;
}

export { createJob, checkJob, getJobStatus, UpdateRequestOptions };

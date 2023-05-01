import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { NextApiRequest, NextApiResponse } from "next";

interface BusinessPlanRequestBody {
  capital: string;
  description: string;
  steps: string;
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function generateBusinessPlan(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured",
      },
    });
    return;
  }

  const { capital, description, steps }: BusinessPlanRequestBody = req.body;

  if (!capital) {
    res.status(400).json({
      error: {
        message: "Please enter a valid capital amount",
      },
    });
    return;
  }

  if (description.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid business description",
      },
    });
    return;
  }

  if (steps.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter steps taken",
      },
    });
    return;
  }

  try {
    const completionRequest: CreateCompletionRequest = {
      model: "text-davinci-003",
      prompt: generateQuestion(capital, description, steps),
      // 1 = Highly creative and diverse, but potentially less coherent
      temperature: 0.7,
      max_tokens: 4000,
    };
    const completion = await openai.createCompletion(completionRequest);
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch (error: any) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generateQuestion(
  capital: string,
  description: string,
  steps: string
): string {
  return `You are a business advisor. This is what your client has provided you with:
  ${description}.
  The amount of capital I currently have in Euros is ${capital}.
  ${steps}.
  - Ask them a single RELEVANT question, which requires a long answer, that can assist you the advisor.
  `;
}

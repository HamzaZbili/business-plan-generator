import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { NextApiRequest, NextApiResponse } from "next";

interface BusinessPlanRequestBody {
  capital: string;
  description: string;
  steps: string;
  wildCard: string;
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function generatePlan(
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

  const { capital, description, steps, wildCard }: BusinessPlanRequestBody =
    req.body;

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

  if (wildCard.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please complete form",
      },
    });
    return;
  }

  try {
    const completionRequest: CreateCompletionRequest = {
      model: "text-davinci-003",
      prompt: fetchPlan(capital, description, steps, wildCard),
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

function fetchPlan(
  capital: string,
  description: string,
  steps: string,
  wildCard: string
): string {
  return `Create a business plan:
  ${description}.
  I have ${capital} euro in capital.
  ${steps}.
  ${wildCard}.
  Pleaes do not finish my sentence. Only write the business plan `;
}

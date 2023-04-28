import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { NextApiRequest, NextApiResponse } from "next";

interface BusinessPlanRequestBody {
  capital: number;
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
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
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

  try {
    const completionRequest: CreateCompletionRequest = {
      model: "text-davinci-003",
      prompt: generatePrompt(capital, description, steps),
      // 1 = Highly creative and diverse, but potentially less coherent
      temperature: 0.7,
      max_tokens: 4000,
    };
    const completion = await openai.createCompletion(completionRequest);
    console.log(completion.data.choices[0].text);
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

function generatePrompt(
  capital: number,
  description: string,
  steps: string
): string {
  return `Please provide a business plan with the following description: ${description}.
  The amount of capital I currently have in Euros is ${capital}.
  The steps I have already taken are as follows:${steps}`;
}

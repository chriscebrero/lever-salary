import express, { Request, Response } from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
	cors({
		origin: "http://localhost:3000",
	})
);
app.use(express.json());

app.post("/api/fetch-job-posting", async (req: Request, res: Response) => {
	const { url } = req.body;

	try {
		const response = await axios.post(
			"https://api.openai.com/v1/chat/completions",
			{
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content:
							"You are a bot that extracts job posting details from URLs.",
					},
					{
						role: "user",
						content: `Please summarize the job posting at this URL: ${url}`,
					},
				],
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				},
			}
		);

		const jobContent = response.data.choices[0].message.content.trim();

		console.log(jobContent, "hello");
		res.json({ jobContent });
	} catch (error) {
		console.error("Error fetching job posting:", error);
		res.status(500).json({ error: "Failed to fetch job posting content" });
	}
});

app.post("/api/predict-salary", async (req: Request, res: Response) => {
	const { jobContent } = req.body;

	try {
		const response = await axios.post(
			"https://api.openai.com/v1/chat/completions",
			{
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content: "You are an expert job market analyst.",
					},
					{
						role: "user",
						content: `Predict the salary and explain: ${jobContent}`,
					},
				],
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				},
			}
		);

		const result = response.data.choices[0].message.content.trim();
		const [salary, explanation] = result
			.split("\n\n")
			.map((str: string) => str.trim());

		res.json({ salary, explanation });
	} catch (error) {
		console.error("Error predicting salary:", error);
		res.status(500).json({ error: "Failed to predict salary" });
	}
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

import express from "express";
const app = express();
const PORT = 3000;

app.use(express.json());

const salesRecords = [ { agentName: "Alice", amount: 1000, salesCount: 3 },
  { agentName: "Bob", amount: 800, salesCount: 2 },];

//Creating a POST endpoint for fetching datas
app.post("/sales", (req,res)=>{
    const { agentName, amount, salesCount } = req.body;

    if (!agentName || amount == null || salesCount == null) {
    return res.status(400).json({
      error: "agentName, amount, and salesCount are required",
    });
  }

  const numericAmount = Number(amount);
  const numericSales = Number(salesCount);

  const existingAgent = salesRecords.find(
    (record) => record.agentName === agentName
  );

  if (existingAgent) {
    existingAgent.amount += numericAmount;
    existingAgent.salesCount += numericSales;

    return res.json({
      message: "Existing agent updated successfully",
    });
  }

  salesRecords.push({
    agentName,
    amount: numericAmount,
    salesCount: numericSales,
  });

  res.json({ message: "Sales record added successfully" });
});


//Creating GET endpoint for leaderboard 
app.get("/leaderboard", (req, res) => {
  const aggregation = new Map();

  // Aggregate totals per agent
  for (const record of salesRecords) {
    const { agentName, amount, salesCount } = record;

    if (!aggregation.has(agentName)) {
      aggregation.set(agentName, {
        agentName,
        totalAmount: 0,
        totalSales: 0,
      });
    }

    const agent = aggregation.get(agentName);
    agent.totalAmount += amount;
    agent.totalSales += salesCount;
  }

  // Sorting by salesAmount
  const sortedAgents = Array.from(aggregation.values()).sort(
    (a, b) => b.totalAmount - a.totalAmount
  );

//Ranking process of agents
  let rank = 0;
  let previousAmount = null;

  const leaderboard = sortedAgents.map((agent, index) => {
    if (agent.totalAmount !== previousAmount) {
      rank = index + 1;
    }

    previousAmount = agent.totalAmount;

    return {
      rank,
      agentName: agent.agentName,
      totalAmount: agent.totalAmount,
      totalSales: agent.totalSales,
    };
  });

  res.json(leaderboard);
});


app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})

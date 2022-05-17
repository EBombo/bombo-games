import { fetchEnterLobby } from "../../../src/api/login";

describe("sync fn", () => {
  it("should run once per request", async () => {
    const processes = [
      { name: "proc One", id: "CBwynuKu6oEwHvhtmnm5" },
      { name: "proc Two", id: "ygvhWw0WARvTCzPkyehx" },
    ];
    
    const tasks = processes.map((proc) => fetchEnterLobby(proc.name));

    await Promise.all(tasks);
  }, 8_000);
}, 10_000);

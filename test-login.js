import { ClientAPIHandler } from "./lib/ClientAPIHandler";

async function testLogin() {
  try {
    const client = new ClientAPIHandler();
    const result = await client.signin("test_username", "test_password");
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

testLogin();
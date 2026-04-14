# User Prompts History

This document contains a chronological record of the prompts provided during the development of the Wallet & Transaction system.

1. **Initial Requirement**
   > "i need to create backend forcused MERN stack APP

this i have provided you with the problem statement below

Problem Statement:
Build a simple transaction system that maintains a wallet for each client. Admin users can credit
or debit wallet balances. Clients can create orders through an API that deducts the order
amount from their wallet. After an order is created, the system must call a fulfillment API, and
the returned fulfillment ID must be stored with the order record.

create an implementation plan to begin with the project

"

2. **API Specifications**
   > "APIs to Implement:
1. Admin – Credit Wallet
POST /admin/wallet/credit
Credits a specified amount to a client’s wallet.
Body: { client_id, amount }
Behavior: Adds amount to wallet and creates a ledger entry.
2. Admin – Debit Wallet
POST /admin/wallet/debit
Debits a specified amount from a client’s wallet.
Body: { client_id, amount }
Behavior: Deducts amount if balance is sufficient and logs a transaction.
3. Client – Create Order
POST /orders
Headers: client-id
Body: { amount }

Behavior:
● Validates wallet balance
● Deducts amount from wallet atomically
● Creates the order
● Calls fulfillment API
● Stores the returned id in the order record
curl --location 'https://jsonplaceholder.typicode.com/posts' \
--header 'Content-Type: application/json' \
--data '{
"userId": "<CLIENT_ID>",
"title": "<ORDER_ID>"
}'
4. Client – Get Order Details
GET /orders/{order_id}
Headers: client-id
Returns order information including amount, status, and fulfillment ID.
5. Wallet Balance
GET /wallet/balance
Headers: client-id
Returns the current wallet balance for the client.

this is how the apis should be used 

use the provided api's 

and use Next.js for frontend along with javascipt"

3. **Approval to Proceed**
   > "proceed"

5. **Bug Report: Activity History**
   > "activities donot appear even after entering the id"

6. **Error Report: Data Fetching**
   > "Could not fetch data. Check Client ID."

7. **Feature Request: Admin Transactions**
   > "display transactions in admin dashboard"

8. **Feature Request: Client Orders**
   > "display orders in client dashboard"

9. **Prompts Summary Request**
   > "create a document where u list all the prompts that i provided"

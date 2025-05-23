import { BoogitService } from "./services/boogit/boogitService";
import { FunctionHandler } from "./types";

const functions: FunctionHandler[] = [];

functions.push({
  schema: {
    name: "get_menu",
    type: "function",
    description: "Get the restaurant menu",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  handler: async () => {
    const menu = await new BoogitService().getMenu();
    console.log("Menu fetched", menu);
    return JSON.stringify(menu);
  }
});

// functions.push({
//   schema: {
//     name: "place_order",
//     type: "function",
//     description: "Place a food order",
//     // TODO: optimize the schma
//     parameters: {
//       type: "object", 
//       properties: {
//         items: {
//           type: "array",
//           description: "Array of menu items to order"
//         },
//         customerDetails: {
//           type: "object",
//           description: "Details of the customer placing the order"
//         }
//       },
//       required: ["items", "customerDetails"]
//     }
//   },
//   handler: async (args: {
//     items: Array<{name: string, quantity: number}>,
//     customerDetails: {
//       name: string,
//       address: string,
//       phone: string
//     }
//   }) => {
//     console.log("New order received:");
//     console.log("Customer:", args.customerDetails);
//     console.log("Order items:");
//     args.items.forEach(item => {
//       console.log(`- ${item.quantity}x ${item.name}`);
//     });
    
//     return JSON.stringify({
//       success: true,
//       message: "Order placed successfully"
//     });
//   }
// });



export default functions;

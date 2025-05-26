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

functions.push({
  schema: {
    name: "place_order",
    type: "function",
    description: "Place a food order",
    // TODO: optimize the schma
    parameters: {
      type: "object", 
      properties: {
        type: {
          type: "string",
          description: "Order method can be PICKUP or DELIVERY"
        },
        customer: {
          type: "object",
          description: "Details of the customer placing the order containing name and phone number"
        },
        deliveryAddress: {
          type: "object",
          description: "Delivery address containing addressLine1"
        },
        items: {
          type: "array",
          description: "Array of menu items to order"
        },
        notes: {
          type: "string",
          description: "Additional customer notes for the order"
        },
        paymentMethod: {
          type: "string",
          description: "Payment method can be CASH or CARD"
        }
      },
      required: ["items", "customerDetails"]
    }
  },
  handler: async (args: {
    type: 'PICKUP' | 'DELIVERY',
    customer: {
      name: string,
      phone: string
    },
    deliveryAddress: {
      addressLine1: string
    },
    items: Array<{name: string, quantity: number}>,
    notes: string,
    paymentMethod: 'CASH' | 'CARD'
  }) => {
    console.log("New order received:");
    console.log("Data:", args);
    console.log("Order items:");
    args.items.forEach(item => {
      console.log(`- ${item.quantity}x ${item.name}`);
    });
    
    return JSON.stringify({
      success: true,
      message: "Order placed successfully"
    });
  }
});



export default functions;

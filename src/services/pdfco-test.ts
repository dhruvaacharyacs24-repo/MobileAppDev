import axios from "axios";

import { env } from "@/lib/env";

export const pdfcoTest = {
  ping: async () => {
    try {
      const { data } = await axios.get(
        "https://api.pdf.co/v1/account/credit/balance",
        {
          headers: {
            "x-api-key": env.EXPO_PUBLIC_PDFCO_API_KEY,
          },
        }
      );

      console.log("PDFCO SUCCESS:", data);

      return data;
    } catch (error) {
      console.log("PDFCO ERROR:", error);

      throw error;
    }
  },
};
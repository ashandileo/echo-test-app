import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";

export const useUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });
};

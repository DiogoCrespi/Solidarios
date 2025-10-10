/**
 * Hook personalizado para buscar doadores
 */
import { useCallback, useState, useEffect } from "react";
import UsersService from "../api/users";
import { User } from "../types/users.types";

export const useDonors = () => {
  const [donors, setDonors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDonors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UsersService.getUsersByRole("DOADOR");
      setDonors(Array.isArray(response) ? response : []);
      return response;
    } catch (err: any) {
      setError(err.message || "Erro ao buscar doadores");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  return {
    donors,
    isLoading,
    error,
    fetchDonors,
  };
};

export default useDonors;


import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptions } from "@tanstack/react-query";

/**
 * Factory para criar hooks de query padronizados
 */

interface EntityService<T, FilterType = void> {
  list: (filter?: FilterType) => Promise<T[]>;
  getById: (id: string) => Promise<T>;
  getByName?: (name: string) => Promise<T>;
  getDefault?: () => Promise<T>;
  listActive?: () => Promise<T[]>;
}

/**
 * Cria hooks de query padronizados para uma entidade
 */
export function createEntityQueryHooks<T, FilterType = void>(
  entityName: string,
  service: EntityService<T, FilterType>,
) {
  /**
   * Hook para listar entidades
   */
  const useListQuery = (
    filter?: FilterType,
    options?: Partial<UseQueryOptions>,
  ) => {
    return useQuery({
      queryKey: [entityName, filter],
      queryFn: () => service.list(filter),
      staleTime: 5 * 60 * 1000, // 5 minutos
      ...options,
    });
  };

  /**
   * Hook para buscar entidade por ID
   */
  const useByIdQuery = (id: string, options?: Partial<UseQueryOptions>) => {
    return useQuery({
      queryKey: [entityName, id],
      queryFn: () => service.getById(id),
      enabled: !!id,
      ...options,
    });
  };

  /**
   * Hook para buscar entidade por nome (se disponível)
   */
  const useByNameQuery = service.getByName
    ? (name: string, options?: Partial<UseQueryOptions>) => {
        return useQuery({
          queryKey: [entityName, "name", name],
          queryFn: () => service.getByName!(name),
          enabled: !!name,
          ...options,
        });
      }
    : undefined;

  /**
   * Hook para buscar entidade padrão (se disponível)
   */
  const useDefaultQuery = service.getDefault
    ? (options?: Partial<UseQueryOptions>) => {
        return useQuery({
          queryKey: [entityName, "default"],
          queryFn: () => service.getDefault!(),
          staleTime: 2 * 60 * 1000, // 2 minutos
          ...options,
        });
      }
    : undefined;

  /**
   * Hook para listar entidades ativas (se disponível)
   */
  const useActiveQuery = service.listActive
    ? (options?: Partial<UseQueryOptions>) => {
        return useQuery({
          queryKey: [entityName, "active"],
          queryFn: () => service.listActive!(),
          staleTime: 30 * 1000, // 30 segundos
          ...options,
        });
      }
    : undefined;

  return {
    useListQuery,
    useByIdQuery,
    useByNameQuery,
    useDefaultQuery,
    useActiveQuery,
  };
}

/**
 * Configurações padrão para diferentes tipos de query
 */
export const queryDefaults = {
  /**
   * Para dados que mudam raramente
   */
  staticData: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  },

  /**
   * Para dados em tempo real
   */
  realTimeData: {
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutos
  },

  /**
   * Para dados moderadamente dinâmicos
   */
  dynamicData: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  },
} as const;

/**
 * Serviço de usuários - comunicação com as rotas de usuários do backend
 */
import api from "./api";
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UsersPage,
} from "../types/users.types";
import { PageOptionsDto } from "../types/common.types";

// Namespace para agrupar as funções do serviço
const UsersService = {
  /**
   * Obter todos os usuários com paginação
   * @param pageOptions Opções de paginação
   * @returns Lista paginada de usuários
   */
  getAll: async (pageOptions?: PageOptionsDto): Promise<UsersPage> => {
    const response = await api.get<UsersPage>("/users", {
      params: pageOptions,
    });
    return response.data;
  },

  /**
   * Obter usuário por ID
   * @param id ID do usuário
   * @returns Usuário encontrado
   */
  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Criar novo usuário
   * @param userData Dados do novo usuário
   * @returns Usuário criado
   */
  create: async (userData: CreateUserDto): Promise<User> => {
    const response = await api.post<User>("/users", userData);
    return response.data;
  },

  /**
   * Atualizar usuário existente
   * @param id ID do usuário
   * @param userData Dados atualizados
   * @returns Usuário atualizado
   */
  update: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Remover usuário
   * @param id ID do usuário a ser removido
   * @returns void
   */
  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  /**
   * Obter usuários por perfil
   * @param role Perfil de usuário (admin, funcionario, doador, beneficiario)
   * @param pageOptions Opções de paginação
   * @returns Lista paginada de usuários
   */
  getByRole: async (
    role: string,
    pageOptions?: PageOptionsDto
  ): Promise<UsersPage> => {
    const response = await api.get<UsersPage>(`/users/role/${role}`, {
      params: pageOptions,
    });
    return response.data;
  },

  /**
   * Ativar/desativar usuário
   * @param id ID do usuário
   * @param isActive Status de ativação
   * @returns Usuário atualizado
   */
  toggleActive: async (id: string, isActive: boolean): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  /**
   * Upload de foto de perfil
   * @param id ID do usuário
   * @param photoFile Arquivo da foto
   * @returns Usuário atualizado com URL da foto
   */
  uploadPhoto: async (id: string, photoFile: any): Promise<User> => {
    console.log('[UsersService] Preparando FormData para upload');
    console.log('[UsersService] photoFile:', { ...photoFile, uri: photoFile.uri?.substring(0, 50) + '...' });
    
    const formData = new FormData();
    
    // Para React Native, usar o formato específico
    // Para web, pode precisar converter base64 para Blob
    if (photoFile.uri.startsWith('data:')) {
      // É base64 - converter para Blob no web
      const response = await fetch(photoFile.uri);
      const blob = await response.blob();
      formData.append('photo', blob, photoFile.name || 'photo.jpg');
    } else {
      // URI normal (React Native)
      formData.append('photo', {
        uri: photoFile.uri,
        type: photoFile.type || photoFile.mimeType || 'image/jpeg',
        name: photoFile.name || 'photo.jpg',
      } as any);
    }

    console.log('[UsersService] FormData preparado, fazendo requisição para:', `/users/${id}/photo`);
    
    // Não definir Content-Type manualmente - deixar o browser/axios definir com boundary
    const response = await api.post<User>(`/users/${id}/photo`, formData, {
      headers: {
        // Remover Content-Type para permitir que o axios/browser defina automaticamente com boundary
      },
      transformRequest: (data) => {
        // Axios deve fazer isso automaticamente, mas garantindo
        return data;
      },
    });
    console.log('[UsersService] Upload concluído com sucesso');
    return response.data;
  },
};

export default UsersService;

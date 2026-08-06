import { apiFetch } from "./api-client";
import type {
  CreateUserInput,
} from "./users.server";

export async function createUser(input:CreateUserInput){
  return apiFetch(
    "/users",
    {
      method:"POST",
      body:JSON.stringify(input),
    }
  );
}

export async function updateUser(id:string,input:unknown){
  return apiFetch(
    `/users/${id}`,
    {
      method:"PATCH",
      body:JSON.stringify(input),
    }
  );
}

export async function disableUser(id:string){
  return apiFetch(
    `/users/${id}/disable`,
    {method:"POST"}
  );
}

export async function assignUserRole(
  userId: string,
  roleId: string,
) {
  return apiFetch(
    `/users/${userId}/roles`,
    {
      method: "POST",
      body: JSON.stringify({ roleId }),
    }
  );
}

export async function removeUserRole(
  userId: string,
  roleId: string,
) {
  return apiFetch(
    `/users/${userId}/roles/${roleId}`,
    {
      method: "DELETE",
    }
  );
}

export type {
  UserListItem,
  UsersResponse,
} from "./users.server";

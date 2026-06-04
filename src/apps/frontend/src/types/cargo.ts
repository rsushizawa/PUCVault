export enum Cargo {
  USUARIO = "USUARIO",
  VALIDADOR = "VALIDADOR",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}

export const CARGO_TO_ROLE_NUM: Record<Cargo, number> = {
  [Cargo.USUARIO]: 1,
  [Cargo.VALIDADOR]: 2,
  [Cargo.ADMIN]: 3,
  [Cargo.SUPERADMIN]: 4,
}

export function isAtLeast(cargo: string, min: Cargo): boolean {
  const order = Object.values(Cargo)
  return order.indexOf(cargo.toUpperCase() as Cargo) >= order.indexOf(min)
}

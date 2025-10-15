import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Roles } from "./Roles";

@Index("FK_roles", ["rolesId"], {})
@Entity("usuario_role", { schema: "sicnova" })
export class UsuarioRole {
  @Column("int", { primary: true, name: "usuarioId" })
  usuarioId: number;

  @Column("int", { primary: true, name: "rolesId" })
  rolesId: number;

  @ManyToOne(() => Roles, (roles) => roles.usuarioRoles, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "rolesId", referencedColumnName: "id" }])
  roles: Roles;
}

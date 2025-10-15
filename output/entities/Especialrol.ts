import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UsuarioEspecialrol } from "./UsuarioEspecialrol";

@Entity("especialrol", { schema: "sicnova" })
export class Especialrol {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("text", { name: "nombre" })
  nombre: string;

  @OneToMany(
    () => UsuarioEspecialrol,
    (usuarioEspecialrol) => usuarioEspecialrol.especialRol
  )
  usuarioEspecialrols: UsuarioEspecialrol[];
}

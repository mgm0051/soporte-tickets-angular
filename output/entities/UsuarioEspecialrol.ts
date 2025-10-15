import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Especialrol } from "./Especialrol";

@Index("FK_especialroles", ["especialRolId"], {})
@Entity("usuario_especialrol", { schema: "sicnova" })
export class UsuarioEspecialrol {
  @Column("int", { primary: true, name: "usuarioId" })
  usuarioId: number;

  @Column("int", { primary: true, name: "especialRolId" })
  especialRolId: number;

  @ManyToOne(
    () => Especialrol,
    (especialrol) => especialrol.usuarioEspecialrols,
    { onDelete: "CASCADE", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "especialRolId", referencedColumnName: "id" }])
  especialRol: Especialrol;
}

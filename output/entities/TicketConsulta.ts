import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("ticket_consulta_ticket_ibfk", ["ticketId"], {})
@Index("ticket_consulta_consulta_ibfk", ["consultaId"], {})
@Entity("ticket_consulta", { schema: "sicnova" })
export class TicketConsulta {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "ticketId" })
  ticketId: number;

  @Column("int", { name: "consultaId" })
  consultaId: number;
}

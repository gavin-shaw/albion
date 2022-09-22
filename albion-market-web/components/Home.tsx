import { NextPage } from "next";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { getSpread } from "../services/backend-service";
import { SpreadDto } from "../services/dto/spread.dto";

const Home: NextPage = () => {
  const [spreads, setSpreads] = useState<SpreadDto[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setBusy(true);
    getSpread().then((spreads) => {
      setBusy(false);
      setSpreads(spreads);
    });
  }, []);

  function column(
    id: string,
    name?: string,
    format?: any
  ): TableColumn<SpreadDto> {
    return {
      id,
      name: name ?? id,
      // @ts-ignore
      selector: (row: SpreadDto) => row[id],
      format,
    };
  }

  const columns = [
    column("name"),
    column("qualityLevel", "quality"),
    column("minOffer", "offer"),
    column("maxRequest", "request"),
    column("spreadPc", "spread", (row: SpreadDto) => `${Math.floor(row.spreadPc)} %`),
    column("historyCount", "history count"),
  ];

  const data = spreads;

  return <DataTable columns={columns} data={data} />;
};

export interface HomeProps {
  spreads: SpreadDto[];
}

export default Home;

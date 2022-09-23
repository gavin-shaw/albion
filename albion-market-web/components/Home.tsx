import { NextPage } from "next";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { getSpread } from "../services/backend-service";
import { SpreadDto } from "../services/dto/spread.dto";
import _ from "lodash";
import moment from "moment";

type ColumnOptions = {
  name?: string;
  format?: (value: any) => string;
};

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

  function column(id: string, options?: ColumnOptions): TableColumn<SpreadDto> {
    // @ts-ignore
    const selector = (row: SpreadDto) => row[id];

    const columnDef: TableColumn<SpreadDto> = {
      id,
      name: options?.name ?? _.startCase(id),
      selector,
      sortable: true,
    };

    if (options?.format) {
      // @ts-ignore
      columnDef.format = (row: SpreadDto) => options.format(selector(row));
    }

    return columnDef;
  }

  const columns = [
    column("location"),
    column("name"),
    column("qualityLevel"),
    column("minOffer", { format: (value) => value.toLocaleString() }),
    column("maxRequest", { format: (value) => value.toLocaleString() }),
    column("spread", { format: (value) => value.toLocaleString() }),
    column("spreadPc", {
      format: (value) => `${Math.floor(value)} %`,
    }),
    column("historyCount"),
    column("updated", {format: (value) => moment.unix(value).fromNow()}),
  ];

  const data = spreads;

  return <DataTable columns={columns} data={data} defaultSortFieldId="historyCount" defaultSortAsc={false} />;
};

export interface HomeProps {
  spreads: SpreadDto[];
}

export default Home;

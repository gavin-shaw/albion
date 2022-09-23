import moment from "moment";
import { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import DataGrid, { Column, SortColumn } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { getSpread } from "../services/backend-service";
import { SpreadDto } from "../services/dto/spread.dto";

type Comparator = (a: SpreadDto, b: SpreadDto) => number;
function getComparator(sortColumn: string): Comparator {
  switch (sortColumn) {
    case "location":
    case "name":
      return (a, b) => {
        return a[sortColumn].localeCompare(b[sortColumn]);
      };
    case "qualityLevel":
    case "minOffer":
    case "maxRequest":
    case "spread":
    case "spreadPc":
    case "historyCount":
    case "updated":
      return (a, b) => {
        return a[sortColumn] - b[sortColumn];
      };
    default:
      throw new Error(`unsupported sortColumn: "${sortColumn}"`);
  }
}

const HomeDataGrid: NextPage = () => {
  const [spreads, setSpreads] = useState<SpreadDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

  useEffect(() => {
    setBusy(true);
    getSpread().then((spreads) => {
      setBusy(false);
      setSpreads(spreads);
    });
  }, []);

  const rows = spreads.filter(it => it.location === 'Martlock Market' && it.historyCount > 40);

  const sortedRows = useMemo((): readonly SpreadDto[] => {
    if (sortColumns.length === 0) return rows;

    return [...rows].sort((a, b) => {
      for (const sort of sortColumns) {
        const comparator = getComparator(sort.columnKey);
        const compResult = comparator(a, b);
        if (compResult !== 0) {
          return sort.direction === "ASC" ? compResult : -compResult;
        }
      }
      return 0;
    });
  }, [rows, sortColumns]);

  const columns: Column<SpreadDto>[] = [
    { key: "location", name: "Location" },
    { key: "name", name: "Name" },
    { key: "qualityLevel", name: "Quality" },
    {
      key: "minOffer",
      name: "Offer",
      formatter: ({ row }) => row.minOffer.toLocaleString(),
    },
    {
      key: "maxRequest",
      name: "Request",
      formatter: ({ row }) => row.maxRequest.toLocaleString(),
    },
    {
      key: "spread",
      name: "Spread",
      formatter: ({ row }) => row.spread.toLocaleString(),
    },
    {
      key: "spreadPc",
      name: "Spread %",
      formatter: ({ row }) => `${Math.floor(row.spreadPc)} %`,
    },
    { key: "historyCount", name: "2 Day Sales" },
    {
      key: "updated",
      name: "Updated",
      formatter: ({ row }) => moment.unix(row.updated).fromNow(),
    },
  ];


  return (
    <DataGrid
      columns={columns}
      rows={sortedRows}
      style={{ height: "100%" }}
      defaultColumnOptions={{
        sortable: true,
        resizable: true,
      }}
      sortColumns={sortColumns}
      onSortColumnsChange={setSortColumns}
    />
  );
};

export default HomeDataGrid;

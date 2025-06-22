import React from "react";
import { Chart } from "react-google-charts";

const data = [
  ["Year", "Clicks"],
  ["2014", 1000],
  ["2015", 1170],
  ["2016", 660],
  ["2017", 1030],
];

const options = {
  colors: ["#2a9d90"],
  chartArea: { width: "70%", height: "70%" },
  height: 400,
  width: 600,
};
export default function BarChart() {
  return <Chart options={options} chartType="Bar" data={data} />;
}

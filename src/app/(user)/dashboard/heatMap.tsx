"use client";
import React from 'react';
import Tooltip from '@uiw/react-tooltip';
import HeatMap from '@uiw/react-heat-map';
import { convertDateToString } from '@/lib/utils';

type Props = {
    data:{
        createdAt:Date;
        count:number;
    }[];
} | undefined


const panelColors = ['var(--rhm-rect, #6c7381)','#C6E48B','#7BC96F', '#239A3B', '#196127']

const SubmissionsHeatMap = (props: Props) => {

   if (!props?.data) return null;

  const formattedDates = props.data.map((item) => ({
  date: convertDateToString(item.createdAt), count: item.count, 
}));

  return (
    <HeatMap
      value={formattedDates}
      width="100%"
      style = {{color: "#888"}}
      startDate={new Date('2025/01/01')}
      panelColors={panelColors}
      rectRender={(props, data) => {
        return (
          <Tooltip placement="top" content={`count: ${data.count || 0}`}>
            <rect {...props} />
          </Tooltip>
        );
      }}
    />
  )
};
export default  SubmissionsHeatMap;

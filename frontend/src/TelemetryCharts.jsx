import React, {memo} from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartCard = ({ title, children }) => (
        <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>{title}</h4>
            <div style={{ height: 200, width: '100%' }}>
                <ResponsiveContainer>
                    {children}
                </ResponsiveContainer>
            </div>
        </div>
    );

export const TelemetryCharts = memo(function TelemetryCharts({ data }){
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            
            <ChartCard title="Left Track Power">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis domain={[-255, 255]} />
                    <Tooltip contentStyle={{ background: '#333', color: '#fff' }} itemStyle={{ color: '#fff' }}/>
                    <Legend />
                    <Line type="monotone" dataKey="expectedLeft" stroke="#8884d8" dot={false} isAnimationActive={false} />
                    <Line type="stepAfter" dataKey="currentLeft" stroke="#82ca9d" dot={false} isAnimationActive={false} />
                </LineChart>
            </ChartCard>

            <ChartCard title="Right Track Power">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis domain={[-255, 255]} />
                    <Tooltip contentStyle={{ background: '#333', color: '#fff' }} itemStyle={{ color: '#fff' }}/>
                    <Legend />
                    <Line type="monotone" dataKey="expectedRight" stroke="#8884d8" dot={false} isAnimationActive={false} />
                    <Line type="stepAfter" dataKey="currentRight" stroke="#82ca9d" dot={false} isAnimationActive={false} />
                </LineChart>
            </ChartCard>

            <ChartCard title="Left PID">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="leftP" stroke="#ff7300" dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="leftI" stroke="#387908" dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="leftD" stroke="#ff0000" dot={false} isAnimationActive={false} />
                </LineChart>
            </ChartCard>

            <ChartCard title="Right PID">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rightP" stroke="#ff7300" dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="rightI" stroke="#387908" dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="rightD" stroke="#ff0000" dot={false} isAnimationActive={false} />
                </LineChart>
            </ChartCard>
        </div>
    );
});
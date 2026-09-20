import React, { memo } from 'react';
import { LineChart, Line, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartCard = ({ title, children }) => (
    <div className="panel chart-card">
        <h4 className="chart-title">{title}</h4>
        <div style={{ height: 220, width: '100%' }}>
            <ResponsiveContainer>
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);

export const LeftPowerChart = memo(function LeftPowerChart({ data }) {
    return (
        <ChartCard title="Left Track Power">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <YAxis domain={[-255, 255]} stroke="#888" />
                <Tooltip contentStyle={{ background: '#222', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }}/>
                {/* Added 'name' prop for readable legends */}
                <Line type="monotone" dataKey="expectedLeft" name="Expected Track Power" stroke="#8884d8" dot={false} isAnimationActive={false} strokeWidth={2}/>
                <Line type="stepAfter" dataKey="currentLeft" name="Current Track Power" stroke="#82ca9d" dot={false} isAnimationActive={false} strokeWidth={2}/>
            </LineChart>
        </ChartCard>
    );
});

export const RightPowerChart = memo(function RightPowerChart({ data }) {
    return (
        <ChartCard title="Right Track Power">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <YAxis domain={[-255, 255]} stroke="#888" />
                <Tooltip contentStyle={{ background: '#222', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }}/>
                <Line type="monotone" dataKey="expectedRight" name="Expected Track Power" stroke="#8884d8" dot={false} isAnimationActive={false} strokeWidth={2}/>
                <Line type="stepAfter" dataKey="currentRight" name="Current Track Power" stroke="#82ca9d" dot={false} isAnimationActive={false} strokeWidth={2}/>
            </LineChart>
        </ChartCard>
    );
});

export const LeftPIDChart = memo(function LeftPIDChart({ data }) {
    return (
        <ChartCard title="Left PID">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <YAxis stroke="#888"/>
                <Tooltip contentStyle={{ background: '#222', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }}/>
                {/* Simplified legends */}
                <Line type="monotone" dataKey="leftP" name="P" stroke="#ffb347" dot={false} isAnimationActive={false} strokeWidth={2}/>
                <Line type="monotone" dataKey="leftI" name="I" stroke="#77dd77" dot={false} isAnimationActive={false} strokeWidth={2}/>
                <Line type="monotone" dataKey="leftD" name="D" stroke="#ff6961" dot={false} isAnimationActive={false} strokeWidth={2}/>
            </LineChart>
        </ChartCard>
    );
});

export const RightPIDChart = memo(function RightPIDChart({ data }) {
    return (
        <ChartCard title="Right PID">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <YAxis stroke="#888"/>
                <Tooltip contentStyle={{ background: '#222', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }}/>
                <Line type="monotone" dataKey="rightP" name="P" stroke="#ffb347" dot={false} isAnimationActive={false} strokeWidth={2}/>
                <Line type="monotone" dataKey="rightI" name="I" stroke="#77dd77" dot={false} isAnimationActive={false} strokeWidth={2}/>
                <Line type="monotone" dataKey="rightD" name="D" stroke="#ff6961" dot={false} isAnimationActive={false} strokeWidth={2}/>
            </LineChart>
        </ChartCard>
    );
});
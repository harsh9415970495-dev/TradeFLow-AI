import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { useSocket } from '../context/SocketContext';

const ChartComponent = ({ data, symbol }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const { socket, isConnected } = useSocket();
  const [chartError, setChartError] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    setChartError(null);

    let chart;
    try {
      // Create chart instance with v5 API
      chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 420,
        layout: {
          background: { color: 'transparent' },
          textColor: '#a1a1aa',
        },
        grid: {
          vertLines: { color: '#27272a' },
          horzLines: { color: '#27272a' },
        },
        rightPriceScale: {
          borderColor: '#27272a',
        },
        timeScale: {
          borderColor: '#27272a',
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 1,
        },
      });

      // ── v5 API: use addSeries(CandlestickSeries, options) ──
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      // Ensure data is sorted by time ascending
      const sortedData = [...data].sort((a, b) => {
        if (a.time < b.time) return -1;
        if (a.time > b.time) return 1;
        return 0;
      });

      // Set candle data
      candlestickSeries.setData(
        sortedData.map((d) => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );

      // ── v5 API: use addSeries(HistogramSeries, options) ──
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#4f46e5',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      volumeSeries.setData(
        sortedData.map((d) => ({
          time: d.time,
          value: d.volume,
          color: d.close >= d.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)',
        }))
      );

      chart.timeScale().fitContent();

      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;
      volumeSeriesRef.current = volumeSeries;

      // Resize handler
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
        volumeSeriesRef.current = null;
      };
    } catch (err) {
      console.error('ChartComponent error:', err);
      setChartError(err.message);
    }
  }, [data]);

  // Handle WebSocket live price updates
  useEffect(() => {
    if (!socket || !isConnected || !candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    const handleLivePriceUpdate = (update) => {
      if (update.symbol?.toUpperCase() !== symbol?.toUpperCase()) return;
      if (!data || data.length === 0) return;

      const lastCandle = data[data.length - 1];
      if (!lastCandle) return;

      try {
        candlestickSeriesRef.current.update({
          time: lastCandle.time,
          open: lastCandle.open,
          high: Math.max(update.high ?? lastCandle.high, update.price),
          low: Math.min(update.low ?? lastCandle.low, update.price),
          close: update.price,
        });

        volumeSeriesRef.current.update({
          time: lastCandle.time,
          value: update.volume ?? lastCandle.volume,
          color:
            update.price >= lastCandle.open
              ? 'rgba(16, 185, 129, 0.35)'
              : 'rgba(239, 68, 68, 0.35)',
        });
      } catch (e) {
        // Silently ignore stale candle update errors
      }
    };

    socket.on('stockPriceUpdate', handleLivePriceUpdate);

    return () => {
      socket.off('stockPriceUpdate', handleLivePriceUpdate);
    };
  }, [socket, isConnected, symbol, data]);

  if (chartError) {
    return (
      <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-zinc-400 text-sm font-medium">Chart failed to load</p>
          <p className="text-zinc-600 text-xs">{chartError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 overflow-hidden">
      {(!data || data.length === 0) ? (
        <div className="h-[420px] flex items-center justify-center">
          <p className="text-zinc-500 text-xs">No chart history available.</p>
        </div>
      ) : (
        <div ref={chartContainerRef} className="w-full" style={{ height: '420px' }} />
      )}
    </div>
  );
};

export default ChartComponent;

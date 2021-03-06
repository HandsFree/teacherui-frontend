// @flow
import { canvas } from '../../../../core/html';

import { Component } from '../../../../core/component';

const config = async (min, avg, max) => {
    return {
        type: 'bar',
        data: {
            labels: [
                await window.beaconingAPI.getPhrase('cr_analytics_min_s'),
                await window.beaconingAPI.getPhrase('cr_analytics_avg_s'),
                await window.beaconingAPI.getPhrase('cr_analytics_max_s'),
            ],
            datasets: [
                {
                    data: [
                        (min * 100),
                        (avg * 100),
                        (max * 100),
                    ],
                    backgroundColor: [
                        '#b71c1c',
                        '#f57f17',
                        '#558b2f',
                    ],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            legend: {
                display: false,
                labels: {
                    fontColor: 'black',
                    fontSize: 18,
                },
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 100,
                            callback: value => `${value}%`,
                            fontColor: 'black',
                            fontSize: 18,
                        },
                    },
                ],
            },
            maintainAspectRatio: true,
            responsive: true,
        },
    };
};

class ScoresGraph extends Component {
    chartObj: any;

    async render() {
        return canvas('#scores.chart');
    }

    async afterMount() {
        const { graphData } = this.props;
        const {
            min,
            avg,
            max,
        } = graphData;
        const ctx: CanvasRenderingContext2D = this.view.getContext('2d');

        // console.log(ctx);
        this.chartObj = new window.Chart(ctx, await config(min, avg, max));
    }
}

export default ScoresGraph;

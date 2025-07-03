import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { ScConversionService, ScConversion } from '../../services/scconversion.service';

@Component({
  selector: 'dashboard-cmp',
  moduleId: module.id,
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  public canvas: any;
  public ctx: any;
  public chartColor: any;
  public MessageStatus: any;
  public chartHours: any;
  public speedChart: any;

  totalConvertedDay: number = 0;
  totalNSConvertDay: number = 0;
  totalFailedDay: number = 0;

  totalConvertedWeek: number = 0;
  totalNSConvertWeek: number = 0;
  totalFailedWeek: number = 0;

  // Weekly bar chart data
  weeklyConverted: number[] = [];
  weeklyNS: number[] = [];
  weeklyFailed: number[] = [];
  weekLabels: string[] = [];

  constructor(private scConversionService: ScConversionService) {}

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts(): void {
    this.scConversionService.getFiles().subscribe({
      next: (files: ScConversion[]) => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const isSameDay = (date: string | Date): boolean => {
          const d = new Date(date);
          return d.toDateString() === today.toDateString();
        };

        const isSameWeek = (date: string | Date): boolean => {
          const d = new Date(date);
          return d >= startOfWeek && d <= today;
        };

        const isSameMonth = (date: string | Date): boolean => {
          const d = new Date(date);
          return d >= startOfMonth && d <= today;
        };

        // Daily counts
        this.totalConvertedDay = files.filter(f => f.status === 'CONVERTED' && isSameDay(f.creationDate)).length;
        this.totalNSConvertDay = files.filter(f => f.status === 'NC' && isSameDay(f.creationDate)).length;
        this.totalFailedDay = files.filter(f => f.status === 'FAILED' && isSameDay(f.creationDate)).length;

        // Weekly counts
        this.totalConvertedWeek = files.filter(f => f.status === 'CONVERTED' && isSameWeek(f.creationDate)).length;
        this.totalNSConvertWeek = files.filter(f => f.status === 'NC' && isSameWeek(f.creationDate)).length;
        this.totalFailedWeek = files.filter(f => f.status === 'FAILED' && isSameWeek(f.creationDate)).length;

        // Weekly bar chart data for the last 7 days
        const last7Days: string[] = [];
        const converted: number[] = [];
        const ns: number[] = [];
        const failed: number[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          const label = date.toLocaleDateString('en-US', { weekday: 'short' });
          last7Days.push(label);

          converted.push(
            files.filter(f => f.status === 'CONVERTED' && new Date(f.creationDate).toDateString() === date.toDateString()).length
          );
          ns.push(
            files.filter(f => f.status === 'NC' && new Date(f.creationDate).toDateString() === date.toDateString()).length
          );
          failed.push(
            files.filter(f => f.status === 'FAILED' && new Date(f.creationDate).toDateString() === date.toDateString()).length
          );
        }

        this.weekLabels = last7Days;
        this.weeklyConverted = converted;
        this.weeklyNS = ns;
        this.weeklyFailed = failed;

        // Initialize charts after data loaded
        this.initCharts();
      },
      error: (err) => {
        console.error('Error loading message counts:', err);
        this.totalConvertedDay = this.totalNSConvertDay = this.totalFailedDay = 0;
        this.totalConvertedWeek = this.totalNSConvertWeek = this.totalFailedWeek = 0;
        this.weekLabels = [];
        this.weeklyConverted = this.weeklyNS = this.weeklyFailed = new Array(7).fill(0);
        this.initCharts();
      }
    });
  }

  initCharts() {
    this.chartColor = "#FFFFFF";

    // Pie Chart (MessageStatus)
    this.canvas = document.getElementById("MessageStatus") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    if (this.MessageStatus) this.MessageStatus.destroy();

    this.MessageStatus = new Chart(this.ctx, {
      type: 'pie',
      data: {
        labels: ['Converted', 'NC', 'Failed'],
        datasets: [{
          label: "Message Status",
          backgroundColor: ['#4caf50', '#ffc107', '#f44336'],
          borderWidth: 0,
          data: [this.totalConvertedWeek, this.totalNSConvertWeek, this.totalFailedWeek]
        }]
      },
      options: {
        legend: { display: false },
        tooltips: { enabled: true },
      }
    });

    // Bar Chart (Weekly grouped data)
    this.canvas = document.getElementById("speedChart") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    if (this.speedChart) this.speedChart.destroy();

    this.speedChart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: this.weekLabels,
        datasets: [
          {
            label: 'Converted',
            backgroundColor: '#2ecc71',
            borderColor: '#2ecc71',
            borderWidth: 1,
            data: this.weeklyConverted
          },
          {
            label: 'NC',
            backgroundColor: '#f39c12',
            borderColor: '#f39c12',
            borderWidth: 1,
            data: this.weeklyNS
          },
          {
            label: 'Failed',
            backgroundColor: '#e74c3c',
            borderColor: '#e74c3c',
            borderWidth: 1,
            data: this.weeklyFailed
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { enabled: true }
        },
        scales: {
          xAxes: [{
            stacked: false,
            gridLines: { color: 'rgba(255,255,255,0.1)' },
            barPercentage: 0.7,
            categoryPercentage: 0.8,
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 100,
              fontColor: "#9f9f9f",
              maxTicksLimit: 5
            },
            gridLines: {
              color: 'rgba(255,255,255,0.05)'
            }
          }]
        }
      }
    });
  }
}
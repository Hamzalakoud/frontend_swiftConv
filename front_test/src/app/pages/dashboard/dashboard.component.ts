import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { ScConversionService } from '../../services/scconversion.service';

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
    this.scConversionService.getDashboardStats().subscribe({
      next: (data) => {
        this.totalConvertedDay = data.totalConvertedDay;
        this.totalNSConvertDay = data.totalNSConvertDay;
        this.totalFailedDay = data.totalFailedDay;

        this.totalConvertedWeek = data.totalConvertedWeek;
        this.totalNSConvertWeek = data.totalNSConvertWeek;
        this.totalFailedWeek = data.totalFailedWeek;

        this.weekLabels = data.weeklyData.map((d: any) => {
          const dt = new Date(d.date);
          return dt.toLocaleDateString('fr-FR', { weekday: 'short' }); // French weekday short name
        });

        this.weeklyConverted = data.weeklyData.map((d: any) => d.converted);
        this.weeklyNS = data.weeklyData.map((d: any) => d.ns);
        this.weeklyFailed = data.weeklyData.map((d: any) => d.failed);

        this.initCharts();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques du tableau de bord :', err);
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
        labels: ['Convertis', 'Non convertis', 'Rejetés'],
        datasets: [{
          label: "Statut des messages",
          backgroundColor: ['#4caf50', '#ffc107', '#f44336'],
          borderWidth: 0,
          data: [this.totalConvertedWeek, this.totalNSConvertWeek, this.totalFailedWeek]
        }]
      },
      options: {
        legend: { display: false },
        tooltips: {
          enabled: true,
          callbacks: {
            label: (tooltipItem) => {
              const labels = ['Convertis', 'Non convertis', 'Rejetés'];
              return labels[tooltipItem.index] + ': ' + tooltipItem.yLabel;
            }
          }
        },
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
            label: 'Convertis',
            backgroundColor: '#2ecc71',
            borderColor: '#2ecc71',
            borderWidth: 1,
            data: this.weeklyConverted
          },
          {
            label: 'Non convertis',
            backgroundColor: '#f39c12',
            borderColor: '#f39c12',
            borderWidth: 1,
            data: this.weeklyNS
          },
          {
            label: 'Rejetés',
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
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => context.dataset.label + ': ' + context.parsed.y
            }
          }
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

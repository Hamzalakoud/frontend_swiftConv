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

        // Step 1: Generate 7 days from today going backwards
        const today = new Date();
        const fullWeekDates: string[] = [];
        for (let i = 0; i < 7; i++) {
          const dt = new Date(today);
          dt.setDate(today.getDate() - i);
          fullWeekDates.push(dt.toISOString().slice(0, 10));
        }
        fullWeekDates.reverse(); // Show oldest to newest

        // Step 2: Create a map for quick lookup of data by date
        const dataMap = new Map<string, any>();
        data.weeklyData.forEach((d: any) => {
          dataMap.set(d.date, d);
        });

        // Step 3: Map full week dates to data, fill missing days with zeros
        this.weekLabels = fullWeekDates.map(dateStr => {
          const dt = new Date(dateStr);
          return dt.toLocaleDateString('fr-FR', { weekday: 'short' }); // French weekday short name
        });

        this.weeklyConverted = fullWeekDates.map(dateStr => dataMap.get(dateStr)?.converted || 0);
        this.weeklyNS = fullWeekDates.map(dateStr => dataMap.get(dateStr)?.ns || 0);
        this.weeklyFailed = fullWeekDates.map(dateStr => dataMap.get(dateStr)?.failed || 0);

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

    const pieLabels = ["Convertis", "Non convertis", "Rejetés"];
    const pieColors = ["#2ecc71", "#f39c12", "#e74c3c"];
    const pieData = [
      this.totalConvertedWeek,
      this.totalNSConvertWeek,
      this.totalFailedWeek,
    ];
    const total = pieData.reduce((a, b) => a + b, 0);

    this.MessageStatus = new Chart(this.ctx, {
      type: "pie",
      data: {
        labels: pieLabels,
        datasets: [{
          label: "Statut",
          data: pieData,
          backgroundColor: pieColors,
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                return `${context.label}: ${value} (${percent}%)`;
              },
            },
          },
          legend: {
            display: false, // Hide default legend; we add custom below
          }
        }
      }
    });

    // Insert custom legend with percentages dynamically
    const legendContainer = document.getElementById('customPieLegend');
    if (legendContainer) {
      legendContainer.innerHTML = pieLabels.map((label, i) => {
        const value = pieData[i];
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
        return `
          <i class="fa fa-circle" style="color:${pieColors[i]}; margin-right: 5px;"></i>
          <strong>${label}:</strong> ${percent}%
        `;
      }).join('<br>');
    }

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
              maxTicksLimit: 5,
              stepSize: 25
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

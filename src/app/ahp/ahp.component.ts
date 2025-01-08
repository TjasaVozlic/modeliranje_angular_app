import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';


interface ApiResponse {
  rc: number;
  weights: number[];
  ranks: { name: string; relative_closeness: number, rank: number }[];
}
@Component({
  selector: 'app-ahp',
  standalone: false,
  
  templateUrl: './ahp.component.html',
  styleUrl: './ahp.component.css'
})
export class AhpComponent implements AfterViewInit {
  criteria: string[] = [
    'prihodki', 'odstotek_spremembe_prihodkov', 'cisti_dobicek', 
    'rast_prihodkov', 'sredstva', 'debt_to_equity_ratio', 'roi'
  ];
  pairwiseCriteria: [string, string][] = [];
  // Human-readable names (for the UI)
  criteriaDisplay: { [key: string]: string } = {
    "prihodki": "Prihodki",
    "odstotek_spremembe_prihodkov": "Odstotek spremembe prihodkov",
    "cisti_dobicek": "Čisti dobiček",
    "rast_prihodkov": "Rast prihodkov",
    "sredstva": "Sredstva",
    "debt_to_equity_ratio": "Razmerje med dolgom in kapitalom",
    "roi": "Donosnost naložbe"
  }
  ;
  result: ApiResponse | null = null; // Initialize as null
  chart: any;
  pairwiseMatrix: number[][] = [];
  preferenceScale: number[] = [2, 3, 4, 5, 6, 7, 8, 9];
  comparisons: { index: number; preference: number; selected: string }[] = [];
  showWarning = false;
  selectedCriteria: string[] = [];
  selectedAlternatives: string[] = [];

  @ViewChild('closenessChartCanvas') closenessChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('weightsChartCanvas') weightsChartCanvas!: ElementRef<HTMLCanvasElement>;

  closenessChart: Chart | null = null;
  weightsChart: Chart | null = null;


  constructor(private fb: FormBuilder, private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.generatePairwiseCriteria();
  }

  ngAfterViewInit(): void {
    // Wait until view is initialized
    this.createClosenessChart(); // Ustvari graf relativne bližine
    this.createWeightsChart(); // Ustvari graf teže kriterijev
    
  }

  generatePairwiseCriteria() {
    this.pairwiseCriteria = [];
    // Generate pairs only from selectedCriteria
    const criteriaToCompare = this.selectedCriteria.length ? this.selectedCriteria : this.criteria;
  
    for (let i = 0; i < criteriaToCompare.length; i++) {
      for (let j = i + 1; j < criteriaToCompare.length; j++) {
        this.pairwiseCriteria.push([criteriaToCompare[i], criteriaToCompare[j]]);
      }
    }
  
    // Initialize matrix for selected criteria
    this.initializeMatrix();
  }
  

  initializeMatrix() {
    const n = this.criteria.length;
    this.pairwiseMatrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => 1)
    );
  }

  updateComparison(index: number, selected: string) {
    // Update which criterion is preferred (A or B)
    const comparison = this.comparisons.find(c => c.index === index);
    if (comparison) {
      comparison.selected = selected;
    } else {
      this.comparisons.push({ index, preference: 1, selected });
    }
  }

  updatePreference(index: number, value: number) {
    // Update the preference value
    const comparison = this.comparisons.find(c => c.index === index);
    if (comparison) {
      comparison.preference = value;
    } else {
      this.comparisons.push({ index, preference: value, selected: '' });
    }
  }

  calculateMatrix() {
    const n = this.selectedCriteria.length;

    // Reset matrix
    this.initializeMatrix();
    console.log('Pairwise Matrix:', this.comparisons);
    this.pairwiseMatrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => 1)
    );
    // Apply user inputs to the pairwiseMatrix
    for (const { index, preference, selected } of this.comparisons) {
      const [criterionA, criterionB] = this.pairwiseCriteria[index];
      const i = this.selectedCriteria.indexOf(criterionA);
      const j = this.selectedCriteria.indexOf(criterionB);

      if (selected === 'A') {
        this.pairwiseMatrix[i][j] = preference;
        this.pairwiseMatrix[j][i] = 1 / preference;
      } else if (selected === 'B') {
        this.pairwiseMatrix[j][i] = preference;
        this.pairwiseMatrix[i][j] = 1 / preference;
      }
    }
    console.log('Comparisons:', this.comparisons);
    console.log('Generated Pairwise Matrix:', this.pairwiseMatrix);

    const request = {
      "selectedCriteria": this.selectedCriteria,
      "data": this.pairwiseMatrix
    };
    console.log('request', request);
    if (this.pairwiseMatrix) {
      this.http.post('http://127.0.0.1:5000/ahp', request)
        .subscribe(response => {
          this.result = response as ApiResponse;
          console.log(this.result);
          // this.cdr.detectChanges();
          // this.createChart();  // Create the chart after receiving the response
          if (this.result.rc > 0.1) {
            this.showWarning = true;
          }
          else {
            this.showWarning = false;
            this.cdr.detectChanges();
            this.createClosenessChart(); // Ustvari graf relativne bližine
            this.createWeightsChart(); // Ustvari graf teže kriterijev
          }
        });
    } else {
      console.log('Form is not valid');
    }
  }
    // Helper function to get the display name for criteria
  getDisplayName(criterion: string): string {
    return this.criteriaDisplay[criterion] || criterion;
  }  
  
  isEnakoSelected(index: number): boolean {
    const comparison = this.comparisons.find(c => c.index === index);
    return comparison ? comparison.selected === 'A' : false;
  }
  
  // Method to check if "Koliko Bolj" has been selected
  isPreferenceScaleSelected(index: number): boolean {
    const comparison = this.comparisons.find(c => c.index === index);
    return comparison ? comparison.selected === 'B': false;
  }

  // Method to check if "Koliko Bolj" has been selected
  isEqualSelected(index: number): boolean {
    const comparison = this.comparisons.find(c => c.index === index);
    return comparison ? comparison.selected === 'A': false;
  }

  updateSelection(criterion: string, event: any) {
    const isSelected = event.target.checked;
    if (isSelected) {
      this.selectedCriteria.push(criterion);
    } else {
      const index = this.selectedCriteria.indexOf(criterion);
      if (index !== -1) {
        this.selectedCriteria.splice(index, 1);
      }
    }
  
    // Regenerate pairwise criteria and reset comparisons
    this.generatePairwiseCriteria();
    this.comparisons = []; // Clear previous comparisons
  
    console.log('Selected Criteria:', this.selectedCriteria);
    console.log('Updated Pairwise Criteria:', this.pairwiseCriteria);
  }
  

  updateAlternativeSelection(alternative: string, event: any) {
    const isSelected = event.target.checked;
    if (isSelected) {
      this.selectedAlternatives.push(alternative);
    } else {
      const index = this.selectedAlternatives.indexOf(alternative);
      if (index !== -1) {
        this.selectedAlternatives.splice(index, 1);
      }
    }
    console.log(this.selectedAlternatives);
    this.generatePairwiseCriteria();


  }
  createClosenessChart() {
      // Prepare chart data
    const names = this.result?.ranks.map(item => item.name) || [];
    const closeness = this.result?.ranks.map(item => item.relative_closeness) || [];
    const ranks = this.result?.ranks.map(item => item.rank) || [];

    if (!this.closenessChartCanvas) return;
    const ctx = this.closenessChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.closenessChart) {
      this.closenessChart.destroy();
    }

    this.closenessChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [{
          label: 'Relative Closeness',
          data: closeness,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Rank: ${ranks[context.dataIndex]}, Closeness: ${context.raw}`;
              }
            }
          }
        }
      }
    });

  }

  createWeightsChart() {
    if (!this.weightsChartCanvas) return;
    const ctx = this.weightsChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.weightsChart) {
      this.weightsChart.destroy();
    }

    this.weightsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.selectedCriteria,
        datasets: [
          {
            label: 'Feature Weights',
            data: this.result?.weights?.map(weight => weight || 0) || [],
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: { beginAtZero: true },
        },
      },
    });
  }

}

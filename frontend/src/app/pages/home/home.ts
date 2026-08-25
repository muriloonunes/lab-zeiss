import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  items: ServicoItem[] = [
    {
      id: 'cmm',
      title: 'Medição por Coordenadas (CMM)',
      description:
        'Inspeção dimensional geométrica e toleranciamento GD&T em máquinas de medir por coordenadas ZEISS.',
      icon: 'icon-1',
    },
    {
      id: 'reverse',
      title: 'Engenharia Reversa',
      description:
        'Criação de modelos CAD e STL a partir de peças físicas, utilizando tecnologias de digitalização 3D e softwares especializados.',
      icon: 'icon-2',
    },
    {
      id: 'q-control',
      title: 'Controle de Qualidade',
      description:
        'Inspeção seriada, relatório FAI e análise de desvios dimensionais por mapa de cores.',
      icon: 'icon-3',
    },
  ];
}

export interface ServicoItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

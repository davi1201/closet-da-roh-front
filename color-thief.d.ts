// Dentro do seu arquivo .d.ts (ex: src/color-thief.d.ts)

declare module 'color-thief' {
  // Define o que é um "Color" (um array de 3 números: [R, G, B])
  type Color = [number, number, number];

  // Define a classe ColorThief que é exportada como default
  export default class ColorThief {
    /**
     * Pega a cor dominante de uma imagem.
     * @param img O elemento HTML <img>
     * @param quality Opcional. 1 é a maior qualidade, 10 é o padrão.
     */
    getColor: (img: HTMLImageElement | null, quality?: number) => Color;

    /**
     * Pega uma paleta de cores da imagem.
     * @param img O elemento HTML <img>
     * @param colorCount Opcional. O número de cores na paleta. Padrão é 10.
     * @param quality Opcional. 1 é a maior qualidade, 10 é o padrão.
     */
    getPalette: (img: HTMLImageElement | null, colorCount?: number, quality?: number) => Color[];
  }
}

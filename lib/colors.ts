export type AtlassianColor = {
  name: string
  hex: string
  label: string
}

// 8 couleurs de la charte Atlassian + une couleur grise par défaut
export const ATLASSIAN_COLORS: AtlassianColor[] = [
  { name: 'blue',   hex: '#0C66E4', label: 'Bleu'   },
  { name: 'teal',   hex: '#1D9A8A', label: 'Teal'   },
  { name: 'green',  hex: '#22A06B', label: 'Vert'   },
  { name: 'yellow', hex: '#CF9F02', label: 'Jaune'  },
  { name: 'orange', hex: '#E56910', label: 'Orange' },
  { name: 'red',    hex: '#C9372C', label: 'Rouge'  },
  { name: 'purple', hex: '#6E5DC6', label: 'Violet' },
  { name: 'gray',   hex: '#8B9BB4', label: 'Gris'   },
]

export const DEFAULT_COLOR = ATLASSIAN_COLORS[0].hex

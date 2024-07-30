
const iconPaths: { [key: string]: string } = {
    'sword.png': '../images/sword.png',
    'rubik.png': '../images/rubik.png',
    'iron-ore.png': '../images/iron-ore.png',
  };
  
  export function findIcon(iconName: string): string {
    return iconPaths[iconName] || '';
  }
  

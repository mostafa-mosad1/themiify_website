// types/images.d.ts
declare module "*.png" {
  const content: any;
  export default content;
}

declare module "*.jpg" {
  const content: any;
  export default content;
}

declare module "*.jpeg" {
  const content: any;
  export default content;
}

declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "*.webp" {
  const content: any;
  export default content;
}

declare module "*.ico" {
  const content: any;
  export default content;
}

declare module "*.css" {
  const content: { [key: string]: string };
  export default content;
}

declare module "quill/dist/quill.snow.css";
declare module "./globals.css";

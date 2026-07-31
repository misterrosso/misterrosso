import { readdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const galleryPath = join(process.cwd(), 'public', 'images', 'gallery');
    
    let files: string[] = [];
    try {
      files = await readdir(galleryPath);
    } catch (dirError) {
      // Gallery folder doesn't exist, return empty array
      console.warn(`Gallery folder not found at ${galleryPath}`);
      return NextResponse.json([]);
    }
    
    // Filter for image files only
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        src: `/images/gallery/${file}`,
        alt: file.replace(/\.[^/.]+$/, '')
      }));
    
    // Shuffle array randomly
    const shuffled = images.sort(() => Math.random() - 0.5);
    
    return NextResponse.json(shuffled);
  } catch (error) {
    console.error('Error reading gallery:', error);
    return NextResponse.json([]);
  }
}

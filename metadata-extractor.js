// Metadata Extractor for KMRL Document Management System

import { getMeta } from 'unpdf';
import EXIF from 'exif-js';
import OfficeDocumentProperties from 'office-document-properties';

/**
 * Extracts metadata from various document types
 */
export class MetadataExtractor {
    /**
     * Extract metadata from a file based on its type
     * @param {File} file - The file to extract metadata from
     * @returns {Promise<Object>} Extracted metadata
     */
    static async extract(file) {
        const metadata = {
            title: '',
            date: '',
            department: '',
            tags: []
        };

        try {
            // Extract common metadata
            metadata.title = this.extractTitle(file.name);

            // Extract type-specific metadata
            if (file.type === 'application/pdf') {
                await this.extractPDFMetadata(file, metadata);
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.type === 'application/msword') {
                await this.extractDOCXMetadata(file, metadata);
            } else if (file.type.startsWith('image/')) {
                await this.extractImageMetadata(file, metadata);
            }

            // Set default values if none found
            if (!metadata.date) {
                metadata.date = new Date(file.lastModified).toISOString().split('T')[0];
            }

            return metadata;
        } catch (error) {
            console.warn(`Error extracting metadata from ${file.name}:`, error);
            // Return basic metadata even if extraction fails
            return {
                title: this.extractTitle(file.name),
                date: new Date(file.lastModified).toISOString().split('T')[0],
                department: '',
                tags: []
            };
        }
    }

    /**
     * Extract title from filename
     * @param {string} filename - The filename
     * @returns {string} Extracted title
     */
    static extractTitle(filename) {
        // Remove extension and capitalize first letter of each word
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
        return nameWithoutExt
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Extract metadata from PDF files
     * @param {File} file - The PDF file
     * @param {Object} metadata - Metadata object to populate
     */
    static async extractPDFMetadata(file, metadata) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        try {
            const pdfMeta = await getMeta(uint8Array, { parseDates: true });

            // Extract title from PDF metadata
            if (pdfMeta.info?.Title) {
                metadata.title = pdfMeta.info.Title;
            }

            // Extract creation date
            if (pdfMeta.info?.CreationDate) {
                metadata.date = pdfMeta.info.CreationDate.toISOString().split('T')[0];
            }

            // Extract author as potential department or tag
            if (pdfMeta.info?.Author) {
                const author = pdfMeta.info.Author.toLowerCase();
                if (author.includes('engineering') || author.includes('engineer')) {
                    metadata.department = 'Engineering';
                } else if (author.includes('hr') || author.includes('human resources')) {
                    metadata.department = 'HR';
                } else if (author.includes('finance') || author.includes('accounting')) {
                    metadata.department = 'Finance';
                }

                // Add author as tag
                metadata.tags.push(pdfMeta.info.Author);
            }

            // Extract subject as tags
            if (pdfMeta.info?.Subject) {
                metadata.tags.push(...pdfMeta.info.Subject.split(/[,;]/).map(tag => tag.trim()));
            }

            // Extract keywords as tags
            if (pdfMeta.info?.Keywords) {
                metadata.tags.push(...pdfMeta.info.Keywords.split(/[,;]/).map(tag => tag.trim()));
            }
        } catch (error) {
            console.warn('Error extracting PDF metadata:', error);
        }
    }

    /**
     * Extract metadata from DOCX files
     * @param {File} file - The DOCX file
     * @param {Object} metadata - Metadata object to populate
     */
    static async extractDOCXMetadata(file, metadata) {
        try {
            const buffer = await file.arrayBuffer();
            const props = new OfficeDocumentProperties(buffer);

            // Extract core properties
            const coreProps = props.getCoreProperties();

            if (coreProps.title) {
                metadata.title = coreProps.title;
            }

            if (coreProps.created) {
                metadata.date = new Date(coreProps.created).toISOString().split('T')[0];
            }

            if (coreProps.creator) {
                const creator = coreProps.creator.toLowerCase();
                if (creator.includes('engineering') || creator.includes('engineer')) {
                    metadata.department = 'Engineering';
                } else if (creator.includes('hr') || creator.includes('human resources')) {
                    metadata.department = 'HR';
                } else if (creator.includes('finance') || creator.includes('accounting')) {
                    metadata.department = 'Finance';
                }

                // Add creator as tag
                metadata.tags.push(coreProps.creator);
            }

            if (coreProps.subject) {
                metadata.tags.push(...coreProps.subject.split(/[,;]/).map(tag => tag.trim()));
            }

            if (coreProps.keywords) {
                metadata.tags.push(...coreProps.keywords.split(/[,;]/).map(tag => tag.trim()));
            }
        } catch (error) {
            console.warn('Error extracting DOCX metadata:', error);
        }
    }

    /**
     * Extract metadata from image files
     * @param {File} file - The image file
     * @param {Object} metadata - Metadata object to populate
     */
    static async extractImageMetadata(file, metadata) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // Try to extract EXIF data
                EXIF.getData(img, () => {
                    try {
                        // Extract title from image description
                        const imageDescription = EXIF.getTag(this, 'ImageDescription');
                        if (imageDescription && imageDescription.trim()) {
                            metadata.title = imageDescription;
                        }

                        // Extract creation date from EXIF
                        const dateTime = EXIF.getTag(this, 'DateTime');
                        if (dateTime) {
                            // Convert EXIF date format to ISO format
                            const dateParts = dateTime.split(' ')[0].replace(/:/g, '-');
                            metadata.date = dateParts;
                        }

                        // Extract artist as potential department or tag
                        const artist = EXIF.getTag(this, 'Artist');
                        if (artist) {
                            const artistLower = artist.toLowerCase();
                            if (artistLower.includes('engineering') || artistLower.includes('engineer')) {
                                metadata.department = 'Engineering';
                            } else if (artistLower.includes('hr') || artistLower.includes('human resources')) {
                                metadata.department = 'HR';
                            } else if (artistLower.includes('finance') || artistLower.includes('accounting')) {
                                metadata.department = 'Finance';
                            }

                            // Add artist as tag
                            metadata.tags.push(artist);
                        }

                        // Extract copyright as tag
                        const copyright = EXIF.getTag(this, 'Copyright');
                        if (copyright) {
                            metadata.tags.push(copyright);
                        }
                    } catch (exifError) {
                        console.warn('Error processing EXIF data:', exifError);
                    }
                    resolve();
                });
            };

            // Create object URL for the image
            img.src = URL.createObjectURL(file);

            // Clean up object URL
            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                resolve();
            };

            img.onabort = () => {
                URL.revokeObjectURL(img.src);
                resolve();
            };
        });
    }
}
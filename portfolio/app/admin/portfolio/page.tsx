// app/admin/portfolio/page.tsx
'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, ChangeEvent, FormEvent, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CategoryFromDB, ProjectFromDB, CVFromDB } from '@/lib/portfolio-types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, Edit, RotateCw, HelpCircle, Laptop2Icon, PictureInPictureIcon, BarChart2, Upload, CheckCircle, Circle, Download, Save, ImagePlus, X, Undo2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import Image from 'next/image'; // Pastikan Image diimpor jika Anda ingin preview

// Pemetaan Ikon
const iconMap: { [key: string]: React.ElementType } = { Laptop2Icon: Laptop2Icon, PictureInPictureIcon: PictureInPictureIcon, BarChart2: BarChart2 };
const DefaultIcon = HelpCircle;
const availableIcons = Object.keys(iconMap);

// Nama Bucket (Sesuaikan!)
const CV_BUCKET_NAME = 'cv-files';
const PROJECT_IMAGE_BUCKET_NAME = 'project-images';

// Fungsi helper untuk ekstrak path storage dari URL publik Supabase
function getStoragePathFromUrl(bucketName: string, url: string): string | null {
    if (!url || !bucketName) return null;
    try {
        const urlObject = new URL(url);
        // Struktur umum: https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path/to/file.jpg>
        const pathSegments = urlObject.pathname.split('/');
        // Cari index nama bucket + 1 untuk mulai path file
        const bucketIndex = pathSegments.indexOf(bucketName);
        if (bucketIndex !== -1 && bucketIndex + 1 < pathSegments.length) {
            // Ambil semua segmen setelah nama bucket
            return pathSegments.slice(bucketIndex + 1).join('/');
        }
        console.error(`Bucket name "${bucketName}" not found in URL path: ${urlObject.pathname}`);
        return null;
    } catch (e) {
        console.error(`Invalid URL to parse path: ${url}`, e);
        return null;
    }
}


export default function PortfolioAdminPage() {
    const supabase = createClient();

    // --- State ---
    const [categories, setCategories] = useState<CategoryFromDB[]>([]);
    const [projects, setProjects] = useState<ProjectFromDB[]>([]);
    const [cvs, setCvs] = useState<CVFromDB[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', icon_name: '', content: '', order: 0 });
    const [newProject, setNewProject] = useState({ title: '', description: '', tags: '', link_url: '', category_id: '', order: 0 });
    const [newProjectFiles, setNewProjectFiles] = useState<FileList | null>(null);
    const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
    const [isUploadingCv, setIsUploadingCv] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryFromDB | null>(null);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Omit<ProjectFromDB, 'tags' | 'categories'|'category_name'> & { tags: string; image_urls: string[] } | null>(null);
    const [editProjectFiles, setEditProjectFiles] = useState<FileList | null>(null);
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    // State untuk melacak gambar yg akan dihapus saat edit
    const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
    // Refs
    const cvFileInputRef = useRef<HTMLInputElement>(null);
    const newProjectFileInputRef = useRef<HTMLInputElement>(null);
    const editProjectFileInputRef = useRef<HTMLInputElement>(null);
    // --- End State ---

    // --- Fungsi Fetch Data ---
    const fetchData = useCallback(async (showLoading = true) => { if (showLoading) setIsLoading(true); setError(null); try { const catPromise = supabase.from('categories').select('*').order('order', { ascending: true, nullsFirst: false }).order('name'); const projPromise = supabase.from('projects').select(`*, categories ( name )`).order('order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }); const cvPromise = supabase.from('cvs').select('*').order('uploaded_at', { ascending: false }); const [ { data: catData, error: catError }, { data: projData, error: projError }, { data: cvData, error: cvError } ] = await Promise.all([catPromise, projPromise, cvPromise]); if (catError) throw catError; if (projError) throw projError; if (cvError) throw cvError; setCategories((catData as CategoryFromDB[]) || []); const projectsWithCategory = projData?.map((p: any) => ({ ...p, category_name: p.categories?.name ?? 'N/A' })) || []; setProjects((projectsWithCategory as ProjectFromDB[]) || []); setCvs((cvData as CVFromDB[]) || []); } catch (err: any) { console.error("Error fetching data:", err); setError(err.message || "Gagal memuat data."); toast.error("Gagal memuat data: " + (err.message || "Unknown error")); } finally { if (showLoading) setIsLoading(false); } }, [supabase]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- Handler Form Input ---
    const handleCategoryChange=(e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{const{name:a,value:o}=e.target;setNewCategory(r=>({...r,[a]:a==="order"?o?parseInt(o,10):0:o}))};const handleCategoryIconSelect=(e:string)=>{setNewCategory(a=>({...a,icon_name:e}))};const handleCategorySelect=(e:string)=>{setNewProject(a=>({...a,category_id:e}))};const handleProjectChange=(e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{const{name:a,value:o}=e.target;setNewProject(r=>({...r,[a]:a==="order"?o?parseInt(o,10):0:o}))};const handleCvFileChange=(e:ChangeEvent<HTMLInputElement>)=>{e.target.files&&e.target.files.length>0?setSelectedCvFile(e.target.files[0]):setSelectedCvFile(null)};const handleEditCategoryChange=(e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{if(!editingCategory)return;const{name:a,value:o}=e.target;setEditingCategory(r=>r?{...r,[a]:a==="order"?o?parseInt(o,10):null:o}:null)};const handleEditCategoryIconSelect=(e:string)=>{if(!editingCategory)return;setEditingCategory(a=>a?{...a,icon_name:e}:null)};const handleEditProjectChange=(e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{if(!editingProject)return;const{name:a,value:o}=e.target;setEditingProject(r=>r?{...r,[a]:a==="order"?o?parseInt(o,10):null:o}:null)};const handleEditProjectCategorySelect=(e:string)=>{if(!editingProject)return;setEditingProject(a=>a?{...a,category_id:e}:null)};const handleNewProjectFilesChange=(e:ChangeEvent<HTMLInputElement>)=>{setNewProjectFiles(e.target.files)};const handleEditProjectFilesChange=(e:ChangeEvent<HTMLInputElement>)=>{setEditProjectFiles(e.target.files)};

    // --- Handler Buka Dialog Edit ---
    const openEditCategoryDialog=(e:CategoryFromDB)=>{setEditingCategory({...e});setIsCategoryDialogOpen(!0)};
    const openEditProjectDialog=(e:ProjectFromDB)=>{const{categories:a,category_name:o,...r}=e;setEditingProject({...r,tags:(e.tags||[]).join(", "),image_urls:e.image_urls||[]});setEditProjectFiles(null);setImagesToRemove([]);/*<<< Reset imagesToRemove*/setIsProjectDialogOpen(!0)};

    // --- Fungsi Helper Upload Gambar Proyek ---
    const uploadProjectImages = async (files: FileList): Promise<string[]> => { const uploadedUrls: string[] = []; try { for (const file of Array.from(files)) { const fileExt = file.name.split('.').pop()?.toLowerCase(); const uniqueFileName = `project_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`; const filePath = uniqueFileName; toast.info(`Mengupload ${file.name}...`); const { data, error } = await supabase.storage.from(PROJECT_IMAGE_BUCKET_NAME).upload(filePath, file, { cacheControl: '3600', upsert: false }); if (error) { console.error(`Error uploading ${file.name}:`, error); toast.error(`Gagal upload ${file.name}: ${error.message}`); continue; } if (data?.path) { const { data: urlData } = supabase.storage.from(PROJECT_IMAGE_BUCKET_NAME).getPublicUrl(data.path); if (urlData?.publicUrl) { uploadedUrls.push(urlData.publicUrl); } else { console.error(`Could not get public URL for ${data.path}`); toast.error(`Gagal mendapatkan URL publik untuk ${file.name}`); } } else { throw new Error(`Upload data path not returned for ${file.name}.`);} } } catch (uploadError) { console.error("General error during project image uploads:", uploadError); toast.error("Terjadi kesalahan saat mengupload gambar proyek."); } return uploadedUrls; };

    // --- Handler Submit Form ---
    const handleAddCategory = async (e: FormEvent) => { e.preventDefault();if(!newCategory.name||!newCategory.icon_name){toast.error("Nama Kategori dan Nama Ikon wajib diisi!");return;}setIsProcessing(true); const{error}=await supabase.from('categories').insert([{name:newCategory.name,icon_name:newCategory.icon_name,content:newCategory.content||null, order: newCategory.order || null}]).select();if(error){toast.error("Gagal: "+error.message);console.error(error);}else{toast.success(`Kategori "${newCategory.name}" ditambahkan.`);setNewCategory({name:'',icon_name:'',content:'', order: 0});fetchData(false);}setIsProcessing(false); };
    const handleAddProject = async (e: FormEvent) => { e.preventDefault(); if (!newProject.title || !newProject.category_id) { toast.error("Judul Proyek dan Kategori wajib diisi!"); return; } if (!newProjectFiles || newProjectFiles.length === 0) { toast.error("Pilih minimal satu gambar proyek."); return; } setIsProcessing(true); let uploadedImageUrls: string[] = []; try { uploadedImageUrls = await uploadProjectImages(newProjectFiles); if (uploadedImageUrls.length === 0 && newProjectFiles.length > 0) throw new Error("Tidak ada gambar yang berhasil diupload."); const tagsArray = newProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag); const projectToInsert = { title: newProject.title, description: newProject.description || null, tags: tagsArray.length > 0 ? tagsArray : null, link_url: newProject.link_url || null, image_urls: uploadedImageUrls, category_id: newProject.category_id, order: newProject.order || null }; const { error } = await supabase.from('projects').insert([projectToInsert]).select(); if (error) throw error; toast.success(`Proyek "${newProject.title}" berhasil ditambahkan!`); setNewProject({ title: '', description: '', tags: '', link_url: '', category_id: '', order: 0 }); setNewProjectFiles(null); if (newProjectFileInputRef.current) newProjectFileInputRef.current.value = ''; fetchData(false); } catch (error: any) { console.error("Error adding project:", error); toast.error("Gagal menambahkan proyek: " + error.message); if (uploadedImageUrls.length > 0) { console.error("Attempting cleanup for failed project add..."); try { const pathsToRemove = uploadedImageUrls.map(url => getStoragePathFromUrl(PROJECT_IMAGE_BUCKET_NAME, url)).filter((p): p is string => p !== null); if(pathsToRemove.length > 0) await supabase.storage.from(PROJECT_IMAGE_BUCKET_NAME).remove(pathsToRemove); } catch (cleanupError){ console.error("Cleanup failed", cleanupError)} } } finally { setIsProcessing(false); } };
    const handleUploadCv = async (e: FormEvent) => { e.preventDefault(); if (!selectedCvFile) { toast.error("Pilih file CV."); return; } console.log("Attempting upload for file:", { name: selectedCvFile.name, size: selectedCvFile.size, type: selectedCvFile.type, }); setIsUploadingCv(true); toast.info("Mengupload CV..."); let step = "start"; try { step = "preparing path"; const fileExt = selectedCvFile.name.split('.').pop(); const uniqueFileName = `cv_${Date.now()}_${selectedCvFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`; const filePath = uniqueFileName; console.log(`Uploading to bucket '${CV_BUCKET_NAME}' with path:`, filePath); step = "storage.upload"; const { data: uploadData, error: uploadError } = await supabase.storage.from(CV_BUCKET_NAME).upload(filePath, selectedCvFile, { cacheControl: '3600', upsert: false }); console.log("Storage upload result:", { uploadData, uploadError }); if (uploadError) throw uploadError; if (!uploadData?.path) throw new Error("Upload path not returned from storage."); step = "storage.getPublicUrl"; const { data: urlData } = supabase.storage.from(CV_BUCKET_NAME).getPublicUrl(uploadData.path); console.log("Public URL result:", { urlData }); if (!urlData?.publicUrl) throw new Error("Could not get public URL."); step = "db.insert"; const { error: insertError } = await supabase.from('cvs').insert([{ file_name: selectedCvFile.name, storage_path: uploadData.path, public_url: urlData.publicUrl, is_active: false }]); console.log("DB insert result:", { insertError }); if (insertError) throw insertError; step = "success"; toast.success(`CV "${selectedCvFile.name}" berhasil diupload!`); setSelectedCvFile(null); if (cvFileInputRef.current) cvFileInputRef.current.value = ''; fetchData(false); } catch (err: any) { console.error(`Error during step: ${step}.`); let displayError = `Error during ${step}. Check console.`; if(err){if(typeof err.message==='string'&&err.message){displayError=err.message;}else if(typeof err.error_description==='string'&&err.error_description){displayError=err.error_description;}else if(typeof err.error==='string'&&err.error){displayError=err.error;}else if(typeof err.details==='string'&&err.details){displayError=err.details;}else if(typeof err.status==='number'){displayError=`Request failed with status ${err.status}. Policy/Bucket issue?`;}else if(typeof err==='object'){try{displayError=JSON.stringify(err);}catch(e){}}else if(typeof err==='string'&&err){displayError=err;}} toast.error("Gagal mengupload CV: " + displayError); } finally { setIsUploadingCv(false); } };

    // --- Handler Update ---
    const handleUpdateCategory = async (e: FormEvent) => { e.preventDefault(); if (!editingCategory) return; setIsProcessing(true); const { error } = await supabase .from('categories') .update({ name: editingCategory.name, icon_name: editingCategory.icon_name, content: editingCategory.content || null, order: editingCategory.order || null }) .eq('id', editingCategory.id); if (error) { toast.error("Gagal update kategori: "+error.message); console.error(error); } else { toast.success("Kategori berhasil diperbarui."); setIsCategoryDialogOpen(false); setEditingCategory(null); fetchData(false); } setIsProcessing(false);};
    const handleUpdateProject = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingProject) return;

        setIsProcessing(true);
        let newlyUploadedUrls: string[] = [];

        try {
            // 1. Upload gambar BARU jika ada file dipilih
            if (editProjectFiles && editProjectFiles.length > 0) {
                toast.info(`Mengupload ${editProjectFiles.length} gambar baru...`);
                newlyUploadedUrls = await uploadProjectImages(editProjectFiles);
                if (newlyUploadedUrls.length === 0 && editProjectFiles.length > 0) {
                    throw new Error("Gagal mengupload gambar baru yang dipilih.");
                }
                toast.info("Gambar baru selesai diupload.");
            }

            // 2. Tentukan URL final untuk database
            const keptImageUrls = (editingProject.image_urls || []).filter(url => !imagesToRemove.includes(url));
            const finalImageUrls = [...keptImageUrls, ...newlyUploadedUrls];

            // 3. Siapkan data update DB
            const tagsArray = editingProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            const projectToUpdate = {
                title: editingProject.title,
                description: editingProject.description || null,
                tags: tagsArray.length > 0 ? tagsArray : null,
                link_url: editingProject.link_url || null,
                image_urls: finalImageUrls.length > 0 ? finalImageUrls : null,
                category_id: editingProject.category_id,
                order: editingProject.order || null
            };

            // 4. Update DB
            const { error: dbUpdateError } = await supabase.from('projects').update(projectToUpdate).eq('id', editingProject.id);
            if (dbUpdateError) throw dbUpdateError;

            // 5. Hapus gambar lama dari Storage SETELAH DB sukses
            if (imagesToRemove.length > 0) {
                toast.info("Menghapus gambar lama dari storage...");
                const pathsToRemove = imagesToRemove
                    .map(url => getStoragePathFromUrl(PROJECT_IMAGE_BUCKET_NAME, url))
                    .filter((p): p is string => p !== null);

                if (pathsToRemove.length > 0) {
                    console.log("Removing images marked for deletion:", pathsToRemove);
                    const { error: removeError } = await supabase.storage.from(PROJECT_IMAGE_BUCKET_NAME).remove(pathsToRemove);
                    if (removeError) {
                        console.error("Error removing images from storage:", removeError);
                        toast.error("Gagal menghapus beberapa gambar lama: " + removeError.message);
                    } else {
                         toast.info("Gambar lama berhasil dihapus.");
                    }
                }
            }

            // Sukses Total
            toast.success(`Proyek "${editingProject.title}" berhasil diperbarui!`);
            setIsProjectDialogOpen(false); setEditingProject(null); setEditProjectFiles(null); setImagesToRemove([]);
            if (editProjectFileInputRef.current) editProjectFileInputRef.current.value = '';
            fetchData(false);

        } catch (error: any) {
             console.error("Error updating project:", error);
             toast.error("Gagal memperbarui proyek: " + error.message);
             // Rollback? Jika upload baru sudah terjadi tapi DB gagal.
             // Untuk simpel, kita tidak rollback storage di sini.
             if (newlyUploadedUrls.length > 0) { /* ... logika cleanup jika perlu ... */ }
        } finally {
            setIsProcessing(false);
        }
    };


    // Handler Set Active CV
    const handleSetActiveCv = async (cvIdToActivate: string) => { toast.info("Mengatur CV aktif..."); try { const { error: deactivateError } = await supabase.from('cvs').update({ is_active: false }).eq('is_active', true); if (deactivateError) throw deactivateError; const { error: activateError } = await supabase.from('cvs').update({ is_active: true }).eq('id', cvIdToActivate); if (activateError) throw activateError; toast.success("CV aktif berhasil diubah."); fetchData(false); } catch (err: any) { console.error("Error setting active CV:", err); toast.error("Gagal mengatur CV aktif: " + err.message); } };

    // Handler Delete
    const handleDeleteCategory = async (id: string, name: string) => { if(window.confirm(`Yakin ingin menghapus kategori "${name}"? Ini akan menghapus SEMUA proyek di dalamnya!`)){ setIsProcessing(true); const{error}=await supabase.from('categories').delete().eq('id',id);if(error){toast.error("Gagal: "+error.message);console.error(error);}else{toast.success(`Kategori "${name}" dihapus.`);fetchData(false);} setIsProcessing(false);} };
    const handleDeleteProject = async (id: string, title: string) => {
        const projectToDelete = projects.find(p => p.id === id);
        if (!projectToDelete) return;
        if (window.confirm(`Yakin ingin menghapus proyek "${title}"? Ini juga akan menghapus gambarnya.`)) {
             toast.info(`Menghapus proyek ${title}...`);
             setIsProcessing(true);
            try {
                if (projectToDelete.image_urls && projectToDelete.image_urls.length > 0) {
                     const pathsToRemove = projectToDelete.image_urls
                        .map(url => getStoragePathFromUrl(PROJECT_IMAGE_BUCKET_NAME, url))
                        .filter((p): p is string => p !== null);

                     if (pathsToRemove.length > 0) {
                         console.log(`Removing images:`, pathsToRemove);
                         const { error: storageError } = await supabase.storage.from(PROJECT_IMAGE_BUCKET_NAME).remove(pathsToRemove);
                         if (storageError) { console.error("Storage delete error:", storageError); toast.error("Gagal menghapus beberapa gambar: " + storageError.message); }
                         else { toast.info("Gambar terkait dihapus."); }
                     }
                }
                const { error: dbError } = await supabase.from('projects').delete().eq('id', id);
                if (dbError) throw dbError;
                toast.success(`Proyek "${title}" berhasil dihapus.`);
                fetchData(false);
            } catch (err: any) { console.error("Error deleting project:", err); toast.error("Gagal menghapus proyek: " + err.message); }
            finally { setIsProcessing(false); }
        }
    };
    const handleDeleteCv = async (cv: CVFromDB) => { if(window.confirm(`Yakin ingin menghapus CV "${cv.file_name}"?`)){ toast.info("Menghapus CV..."); setIsProcessing(true); try { const { error: storageError } = await supabase.storage.from(CV_BUCKET_NAME).remove([cv.storage_path]); if (storageError) { console.error("Storage deletion warning:", storageError); } const { error: dbError } = await supabase.from('cvs').delete().eq('id', cv.id); if (dbError) throw dbError; toast.success(`CV "${cv.file_name}" berhasil dihapus.`); fetchData(false); } catch (err: any) { console.error("Error deleting CV:", err); toast.error("Gagal menghapus CV: " + err.message); } finally { setIsProcessing(false); } } };


    // Render Loading/Error
    if (isLoading && categories.length === 0) { return(<div className="container mx-auto p-4 md:p-6 space-y-6"><h1 className="text-2xl font-bold">Manage Portfolio</h1><Skeleton className="h-10 w-32"/><Skeleton className="h-40 w-full"/><Skeleton className="h-10 w-32"/><Skeleton className="h-64 w-full"/><Skeleton className="h-10 w-32"/><Skeleton className="h-40 w-full"/></div>)}
    if (error && categories.length === 0) { return <div className="container mx-auto p-4 md:p-6 text-destructive">Error: {error}</div>; }

    // Render Utama
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center"> <h1 className="text-3xl font-bold">Manage Portfolio</h1> <Button onClick={() => fetchData(true)} variant="outline" size="sm" disabled={isLoading || isProcessing}> <RotateCw className={cn("mr-2 h-4 w-4", (isLoading || isProcessing) && "animate-spin")} /> Refresh Data </Button> </div>

            {/* --- Bagian Kategori --- */}
            <section className="space-y-4 p-4 border rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold border-b pb-2">Categories</h2>
                {/* Form Tambah Kategori */}
                <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-3 bg-muted/50 rounded-md"> <div> <label htmlFor="category-name" className="block text-sm font-medium mb-1">Nama Kategori*</label> <Input id="category-name" name="name" value={newCategory.name} onChange={handleCategoryChange} placeholder="e.g., Web Dev" required /> </div> <div> <label htmlFor="category-icon" className="block text-sm font-medium mb-1">Ikon*</label> <Select name="icon_name_select" onValueChange={handleCategoryIconSelect} value={newCategory.icon_name} required> <SelectTrigger id="category-icon"><SelectValue placeholder="Pilih Ikon"/></SelectTrigger> <SelectContent>{availableIcons.map(iconName=>(<SelectItem key={iconName} value={iconName}><div className="flex items-center gap-2">{React.createElement(iconMap[iconName]||DefaultIcon,{className:"h-4 w-4 opacity-70"})}{iconName}</div></SelectItem>))}</SelectContent> </Select> </div> <div> <Label htmlFor="category-order" className="block text-sm font-medium mb-1">Urutan</Label> <Input id="category-order" name="order" type="number" value={newCategory.order} onChange={handleCategoryChange} placeholder="10" /> </div> <div className="md:col-span-2"> <label htmlFor="category-content" className="block text-sm font-medium mb-1">Deskripsi</label> <Textarea id="category-content" name="content" value={newCategory.content} onChange={handleCategoryChange} placeholder="Deskripsi singkat..." /> </div> <Button type="submit" size="sm" className="md:col-start-5" disabled={isProcessing}> {isProcessing ? 'Menyimpan...' : <><PlusCircle className="mr-2 h-4 w-4"/> Tambah</>} </Button> </form>
                {/* Tabel Kategori */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead className="w-[50px]">Ikon</TableHead><TableHead>Nama Kategori</TableHead><TableHead>Deskripsi</TableHead><TableHead className="w-[60px]">Order</TableHead><TableHead className="text-right w-[100px]">Aksi</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length > 0 ? categories.map((cat) => { const IconComp = iconMap[cat.icon_name] || DefaultIcon; return ( <TableRow key={cat.id}><TableCell><IconComp className="h-5 w-5 text-muted-foreground"/></TableCell><TableCell className="font-medium">{cat.name}</TableCell><TableCell className="max-w-xs truncate">{cat.content || '-'}</TableCell><TableCell>{cat.order ?? '-'}</TableCell><TableCell className="text-right space-x-2"><Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEditCategoryDialog(cat)}><Edit className="h-4 w-4"/></Button><Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteCategory(cat.id, cat.name)}><Trash2 className="h-4 w-4"/></Button></TableCell></TableRow> ); }) : ( <TableRow><TableCell colSpan={5} className="text-center">Belum ada kategori.</TableCell></TableRow> )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* --- Bagian Proyek --- */}
            <section className="space-y-4 p-4 border rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold border-b pb-2">Projects</h2>
                {/* Form Tambah Proyek */}
                <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start p-3 bg-muted/50 rounded-md"> <div className="space-y-3"> <div> <label htmlFor="project-title" className="block text-sm font-medium mb-1">Judul Proyek*</label> <Input id="project-title" name="title" value={newProject.title} onChange={handleProjectChange} placeholder="Judul Proyek Keren" required /> </div> <div> <label htmlFor="project-category" className="block text-sm font-medium mb-1">Kategori*</label> <Select name="category_id" onValueChange={handleCategorySelect} value={newProject.category_id} required> <SelectTrigger id="project-category"><SelectValue placeholder="Pilih Kategori"/></SelectTrigger> <SelectContent>{categories.map(cat=>(<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent> </Select> </div> <div> <label htmlFor="project-order" className="block text-sm font-medium mb-1">Urutan</label> <Input id="project-order" name="order" type="number" value={newProject.order} onChange={handleProjectChange} placeholder="10" /> </div> </div> <div className="space-y-3"> <div> <label htmlFor="project-desc" className="block text-sm font-medium mb-1">Deskripsi</label> <Textarea id="project-desc" name="description" value={newProject.description} onChange={handleProjectChange} placeholder="Deskripsi singkat proyek..." /> </div> <div> <label htmlFor="project-link" className="block text-sm font-medium mb-1">URL Tautan</label> <Input id="project-link" name="link_url" type="url" value={newProject.link_url} onChange={handleProjectChange} placeholder="https://..." /> </div> </div>
                    <div className="space-y-3 md:col-span-2 lg:col-span-1"> <div> <label htmlFor="project-tags" className="block text-sm font-medium mb-1">Tags (pisahkan koma)</label> <Input id="project-tags" name="tags" value={newProject.tags} onChange={handleProjectChange} placeholder="NextJs, Tailwind, Supabase" /> </div> <div> <label htmlFor="project-images-new" className="block text-sm font-medium mb-1">Gambar Proyek*</label> <Input id="project-images-new" name="image_files" type="file" multiple accept="image/*" onChange={handleNewProjectFilesChange} ref={newProjectFileInputRef} required className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/> {newProjectFiles && <div className="text-xs text-muted-foreground mt-1">{Array.from(newProjectFiles).map(f => f.name).join(', ')}</div>} </div> <Button type="submit" size="sm" className="w-full mt-4" disabled={isProcessing || isUploadingCv}> {isProcessing ? 'Menyimpan...' : <><PlusCircle className="mr-2 h-4 w-4"/> Tambah Proyek</>} </Button> </div>
                </form>
                {/* Tabel Proyek */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>Judul Proyek</TableHead><TableHead>Kategori</TableHead><TableHead>Tags</TableHead><TableHead className="w-[60px]">Order</TableHead><TableHead className="text-right w-[100px]">Aksi</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.length > 0 ? projects.map((proj: ProjectFromDB) => ( <TableRow key={proj.id}><TableCell className="font-medium">{proj.title}</TableCell><TableCell>{(proj as any).category_name || proj.category_id}</TableCell><TableCell> <div className="flex flex-wrap gap-1 max-w-xs"> {(proj.tags || []).map((tag: string, index: number) => ( <Badge key={`${tag}-${index}`} variant="secondary">{tag}</Badge> ))} </div> </TableCell><TableCell>{proj.order ?? '-'}</TableCell><TableCell className="text-right space-x-2"><Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEditProjectDialog(proj)}><Edit className="h-4 w-4"/></Button><Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteProject(proj.id, proj.title)}><Trash2 className="h-4 w-4"/></Button></TableCell></TableRow> )) : ( <TableRow><TableCell colSpan={5} className="text-center">Belum ada proyek.</TableCell></TableRow> )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* --- Bagian Kelola CV --- */}
            <section className="space-y-4 p-4 border rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold border-b pb-2">Manage CV</h2>
                <form onSubmit={handleUploadCv} className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-muted/50 rounded-md"> <div className="flex-1 w-full sm:w-auto"> <label htmlFor="cv-file" className="sr-only">Pilih file CV</label> <Input id="cv-file" type="file" accept=".pdf,.doc,.docx" onChange={handleCvFileChange} ref={cvFileInputRef} required className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" /> </div> <Button type="submit" disabled={!selectedCvFile || isUploadingCv} size="sm"> {isUploadingCv ? 'Uploading...' : <><Upload className="mr-2 h-4 w-4"/> Upload CV Baru</>} </Button> </form>
                <div className="overflow-x-auto">
                    <h3 className="text-lg font-medium mb-2 mt-4">Uploaded CVs</h3>
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>Nama File</TableHead><TableHead>Aktif?</TableHead><TableHead>Tgl Upload</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {cvs.length > 0 ? cvs.map((cv) => ( <TableRow key={cv.id}><TableCell className="font-medium">{cv.file_name}</TableCell><TableCell> {cv.is_active ? ( <Badge variant="default"><CheckCircle className="h-4 w-4 mr-1"/> Aktif</Badge> ) : ( <Button variant="outline" onClick={() => handleSetActiveCv(cv.id)} title="Jadikan CV ini yang aktif" className="text-xs h-6 px-2"> Set Active </Button> )} </TableCell><TableCell>{new Date(cv.uploaded_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell><TableCell className="text-right space-x-2"> <a href={cv.public_url} target="_blank" rel="noopener noreferrer" title="Download/View CV" className={cn( "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7" )} > <Download className="h-4 w-4" /> </a> <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteCv(cv)}> <Trash2 className="h-4 w-4" /> </Button> </TableCell></TableRow> )) : ( <TableRow><TableCell colSpan={4} className="text-center">Belum ada CV yang diupload.</TableCell></TableRow> )}
                        </TableBody>
                    </Table>
                </div>
            </section>

             {/* === Dialog Edit Kategori === */}
             <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => { if (!open) setEditingCategory(null); setIsCategoryDialogOpen(open); }}> <DialogContent className="sm:max-w-[425px]"> <DialogHeader> <DialogTitle>Edit Category</DialogTitle> <DialogDescription> Make changes to your category here. Click save when you're done. </DialogDescription> </DialogHeader> {editingCategory && ( <form onSubmit={handleUpdateCategory} className="grid gap-4 py-4"> <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="edit-category-name" className="text-right">Name*</Label> <Input id="edit-category-name" name="name" value={editingCategory.name} onChange={handleEditCategoryChange} className="col-span-3" required /> </div> <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="edit-category-icon" className="text-right">Icon Name*</Label> <Select name="icon_name_select" onValueChange={handleEditCategoryIconSelect} value={editingCategory.icon_name} > <SelectTrigger id="edit-category-icon" className="col-span-3"> <SelectValue placeholder="Pilih Ikon"/> </SelectTrigger> <SelectContent>{availableIcons.map(iconName=>(<SelectItem key={iconName} value={iconName}><div className="flex items-center gap-2">{React.createElement(iconMap[iconName]||DefaultIcon,{className:"h-4 w-4 opacity-70"})}{iconName}</div></SelectItem>))}</SelectContent> </Select> </div> <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="edit-category-order" className="text-right">Order</Label> <Input id="edit-category-order" name="order" type="number" value={editingCategory.order ?? ''} onChange={handleEditCategoryChange} className="col-span-3" placeholder="10"/> </div> <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="edit-category-content" className="text-right">Description</Label> <Textarea id="edit-category-content" name="content" value={editingCategory.content ?? ''} onChange={handleEditCategoryChange} className="col-span-3" placeholder="Category description..." /> </div> <DialogFooter> <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose> <Button type="submit" disabled={isProcessing}><Save className="mr-2 h-4 w-4" /> {isProcessing ? 'Saving...' : 'Save Changes'}</Button> </DialogFooter> </form> )} </DialogContent> </Dialog>

             {/* === Dialog Edit Proyek === */}
             <Dialog open={isProjectDialogOpen} onOpenChange={(open) => { if (!open) { setEditingProject(null); setEditProjectFiles(null); setImagesToRemove([]); } setIsProjectDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader> <DialogTitle>Edit Project</DialogTitle> <DialogDescription> Make changes to your project here. Click save when you're done. Uploading new images will replace existing ones. </DialogDescription> </DialogHeader>
                    {editingProject && (
                        <form onSubmit={handleUpdateProject} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                            {/* Kolom 1 */}
                            <div className="space-y-4"> <div><Label htmlFor="edit-project-title">Title*</Label><Input id="edit-project-title" name="title" value={editingProject.title} onChange={handleEditProjectChange} required /></div> <div><Label htmlFor="edit-project-category">Category*</Label><Select name="category_id" onValueChange={handleEditProjectCategorySelect} value={editingProject.category_id} required><SelectTrigger id="edit-project-category"><SelectValue placeholder="Pilih Kategori"/></SelectTrigger><SelectContent>{categories.map(cat=>(<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select></div> <div><Label htmlFor="edit-project-order">Order</Label><Input id="edit-project-order" name="order" type="number" value={editingProject.order ?? ''} onChange={handleEditProjectChange} placeholder="10"/></div> <div><Label htmlFor="edit-project-link">Link URL</Label><Input id="edit-project-link" name="link_url" type="url" value={editingProject.link_url ?? ''} onChange={handleEditProjectChange} placeholder="https://..."/></div> </div>
                             {/* Kolom 2 */}
                             <div className="space-y-4"> <div><Label htmlFor="edit-project-desc">Description</Label><Textarea id="edit-project-desc" name="description" value={editingProject.description ?? ''} onChange={handleEditProjectChange} placeholder="Project description..." rows={3}/></div> <div><Label htmlFor="edit-project-tags">Tags (comma-separated)</Label><Textarea id="edit-project-tags" name="tags" value={editingProject.tags as string} onChange={handleEditProjectChange} placeholder="tag1, tag2, tag3" rows={2}/></div>
                                 {/* Input File Gambar Edit & Daftar Gambar Lama */}
                                 <div className="space-y-2">
                                     <Label className="text-sm font-medium">Manage Images</Label>
                                     {/* Daftar Gambar Saat Ini */}
                                     <div className="space-y-1 rounded-md border p-3">
                                         <Label className="text-xs font-medium text-muted-foreground">Current Images:</Label>
                                         {editingProject.image_urls && editingProject.image_urls.length > 0 ? (
                                             editingProject.image_urls.map((url, idx) => {
                                                 const isMarkedForRemoval = imagesToRemove.includes(url);
                                                 return ( <div key={idx} className="flex items-center justify-between text-xs gap-2 py-0.5"> <a href={url} target="_blank" rel="noopener noreferrer" className={cn("hover:underline text-blue-500 truncate break-all", isMarkedForRemoval && "line-through text-muted-foreground italic pointer-events-none")}> {url.substring(url.lastIndexOf('/') + 1)} </a> <Button type="button" variant="ghost" size="icon" className={cn("h-5 w-5 flex-shrink-0", isMarkedForRemoval ? "text-amber-600 hover:bg-amber-100" : "text-destructive hover:bg-destructive/10")} onClick={() => { if (isMarkedForRemoval) { setImagesToRemove(prev => prev.filter(item => item !== url)); } else { setImagesToRemove(prev => [...prev, url]); } }} title={isMarkedForRemoval ? "Batal Hapus" : "Tandai untuk Hapus"} > {isMarkedForRemoval ? <Undo2 className="h-3 w-3" /> : <X className="h-3 w-3" />} </Button> </div> );
                                             })
                                         ) : <p className="text-xs text-muted-foreground italic">No current images.</p>}
                                     </div>
                                     {/* Input File Untuk Tambah/Ganti */}
                                     <div className='pt-2'>
                                         <Label htmlFor="project-images-edit" className="text-xs font-medium text-muted-foreground">Upload New Images (Optional, replaces existing if any marked for removal)</Label>
                                         <Input id="project-images-edit" name="image_files" type="file" multiple accept="image/*" onChange={handleEditProjectFilesChange} ref={editProjectFileInputRef} className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 text-xs h-9 mt-1"/>
                                         {editProjectFiles && <div className="text-xs text-muted-foreground mt-1">{Array.from(editProjectFiles).map(f => f.name).join(', ')}</div>}
                                     </div>
                                 </div>
                            </div>
                             <DialogFooter className="md:col-span-2 pt-4"> <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose> <Button type="submit" disabled={isProcessing || isUploadingCv}><Save className="mr-2 h-4 w-4"/> {isProcessing ? 'Saving...' : 'Save Changes'}</Button> </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
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
import { Trash2, PlusCircle, Edit, RotateCw, HelpCircle, Laptop2Icon, PictureInPictureIcon, BarChart2, Upload, CheckCircle, Circle, Download, Save } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';

// Tipe data DB (bisa dari types file)
// interface CategoryFromDB { id: string; name: string; icon_name: string; content: string | null; created_at: string; order?: number | null; }
// interface ProjectFromDB { id: string; category_id: string; title: string; description: string | null; tags: string[] | null; link_url: string | null; image_urls: string[] | null; order: number | null; created_at: string; categories?: { name: string } | null; category_name?: string; }
// interface CVFromDB { id: string; file_name: string; storage_path: string; public_url: string; is_active: boolean; uploaded_at: string; }

// Pemetaan Ikon
const iconMap: { [key: string]: React.ElementType } = { Laptop2Icon: Laptop2Icon, PictureInPictureIcon: PictureInPictureIcon, BarChart2: BarChart2 };
const DefaultIcon = HelpCircle;
const availableIcons = Object.keys(iconMap);

const BUCKET_NAME = 'cv-files';

export default function PortfolioAdminPage() {
    const supabase = createClient();

    // State
    const [categories, setCategories] = useState<CategoryFromDB[]>([]);
    const [projects, setProjects] = useState<ProjectFromDB[]>([]);
    const [cvs, setCvs] = useState<CVFromDB[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', icon_name: '', content: '', order: 0 });
    const [newProject, setNewProject] = useState({ title: '', description: '', tags: '', link_url: '', image_urls: '', category_id: '', order: 0 });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingCategory, setEditingCategory] = useState<CategoryFromDB | null>(null);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Omit<ProjectFromDB, 'tags' | 'image_urls'|'categories'|'category_name'> & { tags: string; image_urls: string } | null>(null);
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);


    // --- Fungsi Fetch Data (Dengan Perbaikan Order) ---
    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        setError(null);
        try {
            const catPromise = supabase
                .from('categories')
                .select('*')
                .order('order', { ascending: true, nullsFirst: false }) // <<< GANTI di sini
                .order('name');

            const projPromise = supabase
                .from('projects')
                .select(`*, categories ( name )`)
                .order('order', { ascending: true, nullsFirst: false }) // <<< GANTI di sini
                .order('created_at', { ascending: false });

            const cvPromise = supabase.from('cvs').select('*').order('uploaded_at', { ascending: false });

            const [
                { data: catData, error: catError },
                { data: projData, error: projError },
                { data: cvData, error: cvError }
            ] = await Promise.all([catPromise, projPromise, cvPromise]);

            // Handle errors...
            if (catError) throw catError;
            if (projError) throw projError;
            if (cvError) throw cvError;

            // Update state...
            setCategories((catData as CategoryFromDB[]) || []); // Type assertion
            const projectsWithCategory = projData?.map((p: any) => ({ ...p, category_name: p.categories?.name ?? 'N/A' })) || [];
            setProjects((projectsWithCategory as ProjectFromDB[]) || []); // Type assertion
            setCvs((cvData as CVFromDB[]) || []);

        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(err.message || "Gagal memuat data.");
            toast.error("Gagal memuat data: " + (err.message || "Unknown error"));
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- Handler Form Input ---
    const handleCategoryChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const{name,value}=e.target; setNewCategory(prev=>({...prev,[name]:name==='order'?(value?parseInt(value,10):0):value})); };
    const handleCategoryIconSelect = (value: string) => {setNewCategory(prev=>({...prev,icon_name:value}));};
    const handleCategorySelect = (value: string) => {setNewProject(prev=>({...prev,category_id:value}));};
    const handleProjectChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const{name,value}=e.target;setNewProject(prev=>({...prev,[name]:name==='order'?(value?parseInt(value,10):0):value}));};
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files.length > 0) { setSelectedFile(e.target.files[0]); } else { setSelectedFile(null); } };
    const handleEditCategoryChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { if (!editingCategory) return; const { name, value } = e.target; setEditingCategory(prev => prev ? { ...prev, [name]: name === 'order' ? (value ? parseInt(value, 10) : null) : value } : null); };
    const handleEditCategoryIconSelect = (value: string) => { if (!editingCategory) return; setEditingCategory(prev => prev ? { ...prev, icon_name: value } : null); };
    const handleEditProjectChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { if (!editingProject) return; const { name, value } = e.target; setEditingProject(prev => prev ? { ...prev, [name]: name === 'order' ? (value ? parseInt(value, 10) : null) : value } : null); };
    const handleEditProjectCategorySelect = (value: string) => { if (!editingProject) return; setEditingProject(prev => prev ? { ...prev, category_id: value } : null); };

    // --- Handler Buka Dialog Edit ---
    const openEditCategoryDialog = (category: CategoryFromDB) => { setEditingCategory({ ...category }); setIsCategoryDialogOpen(true); };
    const openEditProjectDialog = (project: ProjectFromDB) => { const projectDataForForm = { ...project, tags: (project.tags || []).join(', '), image_urls: (project.image_urls || []).join(', ') }; delete (projectDataForForm as any).categories; delete (projectDataForForm as any).category_name; setEditingProject(projectDataForForm); setIsProjectDialogOpen(true); };

    // --- Handler Submit Form ---
    const handleAddCategory = async (e: FormEvent) => { e.preventDefault();if(!newCategory.name||!newCategory.icon_name){toast.error("Nama Kategori dan Nama Ikon wajib diisi!");return;}const{error}=await supabase.from('categories').insert([{name:newCategory.name,icon_name:newCategory.icon_name,content:newCategory.content||null, order: newCategory.order || null}]).select();if(error){console.error("Error adding category:",error);toast.error("Gagal menambahkan kategori: "+error.message);}else{toast.success(`Kategori "${newCategory.name}" berhasil ditambahkan!`);setNewCategory({name:'',icon_name:'',content:'', order: 0});fetchData(false);}};
    const handleAddProject = async (e: FormEvent) => { e.preventDefault();if(!newProject.title||!newProject.category_id){toast.error("Judul Proyek dan Kategori wajib diisi!");return;}const tagsArray=newProject.tags.split(',').map(tag=>tag.trim()).filter(tag=>tag);const imagesArray=newProject.image_urls.split(',').map(url=>url.trim()).filter(url=>url);const{error}=await supabase.from('projects').insert([{title:newProject.title,description:newProject.description||null,tags:tagsArray.length>0?tagsArray:null,link_url:newProject.link_url||null,image_urls:imagesArray.length>0?imagesArray:null,category_id:newProject.category_id,order:newProject.order||null}]).select();if(error){console.error("Error adding project:",error);toast.error("Gagal menambahkan proyek: "+error.message);}else{toast.success(`Proyek "${newProject.title}" berhasil ditambahkan!`);setNewProject({title:'',description:'',tags:'',link_url:'',image_urls:'',category_id:'',order:0});fetchData(false);}};
    const handleUploadCv = async (e: FormEvent) => { e.preventDefault(); if (!selectedFile) { toast.error("Pilih file CV terlebih dahulu."); return; } console.log("Attempting upload for file:", { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type, }); setIsUploading(true); toast.info("Mengupload CV..."); let step = "start"; try { step = "preparing path"; const fileExt = selectedFile.name.split('.').pop(); const uniqueFileName = `cv_${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`; const filePath = uniqueFileName; console.log(`Uploading to bucket '${BUCKET_NAME}' with path:`, filePath); step = "storage.upload"; const { data: uploadData, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, selectedFile, { cacheControl: '3600', upsert: false }); console.log("Storage upload result:", { uploadData, uploadError }); if (uploadError) throw uploadError; if (!uploadData?.path) throw new Error("Upload path not returned from storage."); step = "storage.getPublicUrl"; const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path); console.log("Public URL result:", { urlData }); if (!urlData?.publicUrl) throw new Error("Could not get public URL."); step = "db.insert"; const { error: insertError } = await supabase.from('cvs').insert([{ file_name: selectedFile.name, storage_path: uploadData.path, public_url: urlData.publicUrl, is_active: false }]); console.log("DB insert result:", { insertError }); if (insertError) throw insertError; step = "success"; toast.success(`CV "${selectedFile.name}" berhasil diupload!`); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; fetchData(false); } catch (err: any) { console.error(`Error during step: ${step}.`); console.log("Type of error:", typeof err); console.log("Error object keys:", err ? Object.keys(err).join(', ') : 'N/A'); console.log("Error object toString():", err ? err.toString() : 'N/A'); console.error("Raw error object:", err); let displayError = `Error during ${step}. Check console.`; if(err){if(typeof err.message==='string'&&err.message){displayError=err.message;}else if(typeof err.error_description==='string'&&err.error_description){displayError=err.error_description;}else if(typeof err.error==='string'&&err.error){displayError=err.error;}else if(typeof err.details==='string'&&err.details){displayError=err.details;}else if(typeof err.status==='number'){displayError=`Request failed with status ${err.status}. Policy/Bucket issue?`;}else if(typeof err==='object'){try{displayError=JSON.stringify(err);}catch(e){}}else if(typeof err==='string'&&err){displayError=err;}} toast.error("Gagal mengupload CV: " + displayError); } finally { setIsUploading(false); } };

    // Handler Update
    const handleUpdateCategory = async (e: FormEvent) => { e.preventDefault(); if (!editingCategory) return; const { error } = await supabase .from('categories') .update({ name: editingCategory.name, icon_name: editingCategory.icon_name, content: editingCategory.content || null, order: editingCategory.order || null }) .eq('id', editingCategory.id); if (error) { toast.error("Gagal update kategori: "+error.message); console.error(error); } else { toast.success("Kategori berhasil diperbarui."); setIsCategoryDialogOpen(false); setEditingCategory(null); fetchData(false); } };
    const handleUpdateProject = async (e: FormEvent) => { e.preventDefault(); if (!editingProject) return; const tagsArray = editingProject.tags.split(',').map(tag=>tag.trim()).filter(tag=>tag); const imagesArray = editingProject.image_urls.split(',').map(url=>url.trim()).filter(url=>url); const { error } = await supabase .from('projects') .update({ title: editingProject.title, description: editingProject.description || null, tags: tagsArray.length > 0 ? tagsArray : null, link_url: editingProject.link_url || null, image_urls: imagesArray.length > 0 ? imagesArray : null, category_id: editingProject.category_id, order: editingProject.order || null }) .eq('id', editingProject.id); if (error) { toast.error("Gagal update proyek: "+error.message); console.error(error); } else { toast.success("Proyek berhasil diperbarui."); setIsProjectDialogOpen(false); setEditingProject(null); fetchData(false); } };

    // Handler Set Active CV
    const handleSetActiveCv = async (cvIdToActivate: string) => { toast.info("Mengatur CV aktif..."); try { const { error: deactivateError } = await supabase.from('cvs').update({ is_active: false }).eq('is_active', true); if (deactivateError) throw deactivateError; const { error: activateError } = await supabase.from('cvs').update({ is_active: true }).eq('id', cvIdToActivate); if (activateError) throw activateError; toast.success("CV aktif berhasil diubah."); fetchData(false); } catch (err: any) { console.error("Error setting active CV:", err); toast.error("Gagal mengatur CV aktif: " + err.message); } };

    // Handler Delete
    const handleDeleteCategory = async (id: string, name: string) => { if(window.confirm(`Yakin ingin menghapus kategori "${name}"? Ini akan menghapus SEMUA proyek di dalamnya!`)){const{error}=await supabase.from('categories').delete().eq('id',id);if(error){console.error("Error deleting category:",error);toast.error("Gagal menghapus kategori: "+error.message);}else{toast.success(`Kategori "${name}" berhasil dihapus.`);fetchData(false);}}};
    const handleDeleteProject = async (id: string, title: string) => { if(window.confirm(`Yakin ingin menghapus proyek "${title}"?`)){const{error}=await supabase.from('projects').delete().eq('id',id);if(error){console.error("Error deleting project:",error);toast.error("Gagal menghapus proyek: "+error.message);}else{toast.success(`Proyek "${title}" berhasil dihapus.`);fetchData(false);}}};
    const handleDeleteCv = async (cv: CVFromDB) => { if(window.confirm(`Yakin ingin menghapus CV "${cv.file_name}"?`)){ toast.info("Menghapus CV..."); try { const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([cv.storage_path]); if (storageError) { console.warn("Storage deletion warning:", storageError.message); } const { error: dbError } = await supabase.from('cvs').delete().eq('id', cv.id); if (dbError) throw dbError; toast.success(`CV "${cv.file_name}" berhasil dihapus.`); fetchData(false); } catch (err: any) { console.error("Error deleting CV:", err); toast.error("Gagal menghapus CV: " + err.message); } } };


    // Render Loading/Error
    if (isLoading) { return(<div className="container mx-auto p-4 md:p-6 space-y-6"><h1 className="text-2xl font-bold">Manage Portfolio</h1><Skeleton className="h-10 w-32"/><Skeleton className="h-40 w-full"/><Skeleton className="h-10 w-32"/><Skeleton className="h-64 w-full"/><Skeleton className="h-10 w-32"/><Skeleton className="h-40 w-full"/></div>)}
    if (error) { return <div className="container mx-auto p-4 md:p-6 text-destructive">Error: {error}</div>; }

    // Render Utama
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-8">
            <div className="flex justify-between items-center"> <h1 className="text-3xl font-bold">Manage Portfolio</h1> <Button onClick={() => fetchData(true)} variant="outline" size="sm" disabled={isLoading}> <RotateCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Refresh Data </Button> </div>
            {/* --- Bagian Kategori --- */}
            <section className="space-y-4 p-4 border rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold border-b pb-2">Categories</h2>
                <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-3 bg-muted/50 rounded-md"> <div> <label htmlFor="category-name" className="block text-sm font-medium mb-1">Nama Kategori*</label> <Input id="category-name" name="name" value={newCategory.name} onChange={handleCategoryChange} placeholder="e.g., Web Dev" required /> </div> <div> <label htmlFor="category-icon" className="block text-sm font-medium mb-1">Ikon*</label> <Select name="icon_name_select" onValueChange={handleCategoryIconSelect} value={newCategory.icon_name} required> <SelectTrigger id="category-icon"><SelectValue placeholder="Pilih Ikon"/></SelectTrigger> <SelectContent>{availableIcons.map(iconName=>(<SelectItem key={iconName} value={iconName}><div className="flex items-center gap-2">{React.createElement(iconMap[iconName]||DefaultIcon,{className:"h-4 w-4 opacity-70"})}{iconName}</div></SelectItem>))}</SelectContent> </Select> </div> <div> <Label htmlFor="category-order" className="block text-sm font-medium mb-1">Urutan</Label> <Input id="category-order" name="order" type="number" value={newCategory.order} onChange={handleCategoryChange} placeholder="10" /> </div> <div className="md:col-span-2"> <label htmlFor="category-content" className="block text-sm font-medium mb-1">Deskripsi</label> <Textarea id="category-content" name="content" value={newCategory.content} onChange={handleCategoryChange} placeholder="Deskripsi singkat..." /> </div> <Button type="submit" size="sm" className="md:col-start-5"> <PlusCircle className="mr-2 h-4 w-4"/> Tambah </Button> </form>
                <div className="overflow-x-auto">
                    <Table>{/*NO WHITESPACE*/}<TableHeader>{/*NO WHITESPACE*/}<TableRow><TableHead className="w-[50px]">Ikon</TableHead><TableHead>Nama Kategori</TableHead><TableHead>Deskripsi</TableHead><TableHead className="w-[60px]">Order</TableHead><TableHead className="text-right w-[100px]">Aksi</TableHead></TableRow></TableHeader>{/*NO WHITESPACE*/}<TableBody>{/*NO WHITESPACE*/}{categories.length > 0 ? categories.map((cat) => { const IconComp = iconMap[cat.icon_name] || DefaultIcon; return ( <TableRow key={cat.id}>{/*NO WHITESPACE*/}<TableCell><IconComp className="h-5 w-5 text-muted-foreground"/></TableCell>{/*NO WHITESPACE*/}<TableCell className="font-medium">{cat.name}</TableCell>{/*NO WHITESPACE*/}<TableCell className="max-w-xs truncate">{cat.content || '-'}</TableCell>{/*NO WHITESPACE*/}<TableCell>{cat.order ?? '-'}</TableCell>{/*NO WHITESPACE*/}<TableCell className="text-right space-x-2"><Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEditCategoryDialog(cat)}><Edit className="h-4 w-4"/></Button><Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteCategory(cat.id, cat.name)}><Trash2 className="h-4 w-4"/></Button></TableCell>{/*NO WHITESPACE*/}</TableRow> ); }) : ( <TableRow><TableCell colSpan={5} className="text-center">Belum ada kategori.</TableCell></TableRow> )}{/*NO WHITESPACE*/}</TableBody></Table>
                </div>
            </section>

            {/* --- Bagian Proyek --- */}
            <section className="space-y-4 p-4 border rounded-lg shadow-sm"> <h2 className="text-2xl font-semibold border-b pb-2">Projects</h2> <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start p-3 bg-muted/50 rounded-md"> <div className="space-y-3"> <div> <label htmlFor="project-title" className="block text-sm font-medium mb-1">Judul Proyek*</label> <Input id="project-title" name="title" value={newProject.title} onChange={handleProjectChange} placeholder="Judul Proyek Keren" required /> </div> <div> <label htmlFor="project-category" className="block text-sm font-medium mb-1">Kategori*</label> <Select name="category_id" onValueChange={handleCategorySelect} value={newProject.category_id} required> <SelectTrigger id="project-category"><SelectValue placeholder="Pilih Kategori"/></SelectTrigger> <SelectContent>{categories.map(cat=>(<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent> </Select> </div> <div> <label htmlFor="project-order" className="block text-sm font-medium mb-1">Urutan</label> <Input id="project-order" name="order" type="number" value={newProject.order} onChange={handleProjectChange} placeholder="10" /> </div> </div> <div className="space-y-3"> <div> <label htmlFor="project-desc" className="block text-sm font-medium mb-1">Deskripsi</label> <Textarea id="project-desc" name="description" value={newProject.description} onChange={handleProjectChange} placeholder="Deskripsi singkat proyek..." /> </div> <div> <label htmlFor="project-link" className="block text-sm font-medium mb-1">URL Tautan</label> <Input id="project-link" name="link_url" type="url" value={newProject.link_url} onChange={handleProjectChange} placeholder="https://..." /> </div> </div> <div className="space-y-3 md:col-span-2 lg:col-span-1"> <div> <label htmlFor="project-tags" className="block text-sm font-medium mb-1">Tags (pisahkan koma)</label> <Input id="project-tags" name="tags" value={newProject.tags} onChange={handleProjectChange} placeholder="NextJs, Tailwind, Supabase" /> </div> <div> <label htmlFor="project-images" className="block text-sm font-medium mb-1">URLs Gambar (pisahkan koma)</label> <Textarea id="project-images" name="image_urls" value={newProject.image_urls} onChange={handleProjectChange} placeholder="/images/img1.jpg, /images/img2.png" /> </div> <Button type="submit" size="sm" className="w-full mt-4"> <PlusCircle className="mr-2 h-4 w-4"/> Tambah Proyek </Button> </div> </form>
                <div className="overflow-x-auto">
                    <Table>{/*NO WHITESPACE*/}<TableHeader>{/*NO WHITESPACE*/}<TableRow><TableHead>Judul Proyek</TableHead><TableHead>Kategori</TableHead><TableHead>Tags</TableHead><TableHead className="w-[60px]">Order</TableHead><TableHead className="text-right w-[100px]">Aksi</TableHead></TableRow></TableHeader>{/*NO WHITESPACE*/}<TableBody>{/*NO WHITESPACE*/}{projects.length > 0 ? projects.map((proj: ProjectFromDB) => ( <TableRow key={proj.id}>{/*NO WHITESPACE*/}<TableCell className="font-medium">{proj.title}</TableCell>{/*NO WHITESPACE*/}<TableCell>{(proj as any).category_name || proj.category_id}</TableCell>{/*NO WHITESPACE*/}<TableCell> <div className="flex flex-wrap gap-1 max-w-xs"> {(proj.tags || []).map((tag: string, index: number) => ( <Badge key={`${tag}-${index}`} variant="secondary">{tag}</Badge> ))} </div> </TableCell>{/*NO WHITESPACE*/}<TableCell>{proj.order ?? '-'}</TableCell>{/*NO WHITESPACE*/}<TableCell className="text-right space-x-2"> <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEditProjectDialog(proj)}><Edit className="h-4 w-4"/></Button> <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteProject(proj.id, proj.title)}><Trash2 className="h-4 w-4"/></Button></TableCell>{/*NO WHITESPACE*/}</TableRow> )) : ( <TableRow><TableCell colSpan={5} className="text-center">Belum ada proyek.</TableCell></TableRow> )}{/*NO WHITESPACE*/}</TableBody>
                    </Table>
                </div>
            </section>

            {/* --- Bagian Kelola CV --- */}
            <section className="space-y-4 p-4 border rounded-lg shadow-sm"> <h2 className="text-2xl font-semibold border-b pb-2">Manage CV</h2> <form onSubmit={handleUploadCv} className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-muted/50 rounded-md"> <div className="flex-1 w-full sm:w-auto"> <label htmlFor="cv-file" className="sr-only">Pilih file CV</label> <Input id="cv-file" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} ref={fileInputRef} required className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" /> </div> <Button type="submit" disabled={!selectedFile || isUploading} size="sm"> {isUploading ? 'Uploading...' : <><Upload className="mr-2 h-4 w-4"/> Upload CV Baru</>} </Button> </form>
                <div className="overflow-x-auto"> <h3 className="text-lg font-medium mb-2 mt-4">Uploaded CVs</h3> <Table>{/*NO WHITESPACE*/}<TableHeader>{/*NO WHITESPACE*/}<TableRow><TableHead>Nama File</TableHead><TableHead>Aktif?</TableHead><TableHead>Tgl Upload</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>{/*NO WHITESPACE*/}<TableBody>{/*NO WHITESPACE*/}{cvs.length > 0 ? cvs.map((cv) => ( <TableRow key={cv.id}>{/*NO WHITESPACE*/}<TableCell className="font-medium">{cv.file_name}</TableCell>{/*NO WHITESPACE*/}<TableCell> {cv.is_active ? ( <Badge variant="default"><CheckCircle className="h-4 w-4 mr-1"/> Aktif</Badge> ) : ( <Button variant="outline" onClick={() => handleSetActiveCv(cv.id)} title="Jadikan CV ini yang aktif" className="text-xs h-6 px-2"> Set Active </Button> )} </TableCell>{/*NO WHITESPACE*/}<TableCell>{new Date(cv.uploaded_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>{/*NO WHITESPACE*/}<TableCell className="text-right space-x-2"> <a href={cv.public_url} target="_blank" rel="noopener noreferrer" title="Download/View CV" className={cn( "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7" )} > <Download className="h-4 w-4" /> </a> <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteCv(cv)}> <Trash2 className="h-4 w-4" /> </Button> </TableCell>{/*NO WHITESPACE*/}</TableRow> )) : ( <TableRow><TableCell colSpan={4} className="text-center">Belum ada CV yang diupload.</TableCell></TableRow> )}{/*NO WHITESPACE*/}</TableBody>
                    </Table> </div>
            </section>

             {/* === Dialog Edit Kategori === */}
             <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => { if (!open) setEditingCategory(null); setIsCategoryDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader> <DialogTitle>Edit Category</DialogTitle> <DialogDescription> Make changes to your category here. Click save when you're done. </DialogDescription> </DialogHeader>
                    {editingCategory && (
                        <form onSubmit={handleUpdateCategory} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="edit-category-name" className="text-right">Name*</Label> <Input id="edit-category-name" name="name" value={editingCategory.name} onChange={handleEditCategoryChange} className="col-span-3" required /> </div>
                            <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="edit-category-icon" className="text-right">Icon Name*</Label> <Select name="icon_name_select" onValueChange={handleEditCategoryIconSelect} value={editingCategory.icon_name} > <SelectTrigger id="edit-category-icon" className="col-span-3"> <SelectValue placeholder="Pilih Ikon"/> </SelectTrigger> <SelectContent>{availableIcons.map(iconName=>(<SelectItem key={iconName} value={iconName}><div className="flex items-center gap-2">{React.createElement(iconMap[iconName]||DefaultIcon,{className:"h-4 w-4 opacity-70"})}{iconName}</div></SelectItem>))}</SelectContent> </Select> </div>
                            {/* Input Order Kategori di Edit */}
                            <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="edit-category-order" className="text-right">Order</Label> <Input id="edit-category-order" name="order" type="number" value={editingCategory.order ?? ''} onChange={handleEditCategoryChange} className="col-span-3" placeholder="10"/> </div>
                            <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="edit-category-content" className="text-right">Description</Label> <Textarea id="edit-category-content" name="content" value={editingCategory.content ?? ''} onChange={handleEditCategoryChange} className="col-span-3" placeholder="Category description..." /> </div>
                             <DialogFooter> <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose> <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Changes</Button> </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

             {/* === Dialog Edit Proyek === */}
             <Dialog open={isProjectDialogOpen} onOpenChange={(open) => { if (!open) setEditingProject(null); setIsProjectDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader> <DialogTitle>Edit Project</DialogTitle> <DialogDescription> Make changes to your project here. Click save when you're done. </DialogDescription> </DialogHeader>
                    {editingProject && (
                        <form onSubmit={handleUpdateProject} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                            {/* Kolom 1 */}
                            <div className="space-y-4"> <div><Label htmlFor="edit-project-title">Title*</Label><Input id="edit-project-title" name="title" value={editingProject.title} onChange={handleEditProjectChange} required /></div> <div><Label htmlFor="edit-project-category">Category*</Label><Select name="category_id" onValueChange={handleEditProjectCategorySelect} value={editingProject.category_id} required><SelectTrigger id="edit-project-category"><SelectValue placeholder="Pilih Kategori"/></SelectTrigger><SelectContent>{categories.map(cat=>(<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select></div> <div><Label htmlFor="edit-project-order">Order</Label><Input id="edit-project-order" name="order" type="number" value={editingProject.order ?? ''} onChange={handleEditProjectChange} placeholder="10"/></div> <div><Label htmlFor="edit-project-link">Link URL</Label><Input id="edit-project-link" name="link_url" type="url" value={editingProject.link_url ?? ''} onChange={handleEditProjectChange} placeholder="https://..."/></div> </div>
                             {/* Kolom 2 */}
                             <div className="space-y-4"> <div><Label htmlFor="edit-project-desc">Description</Label><Textarea id="edit-project-desc" name="description" value={editingProject.description ?? ''} onChange={handleEditProjectChange} placeholder="Project description..." rows={4}/></div> <div><Label htmlFor="edit-project-tags">Tags (comma-separated)</Label><Textarea id="edit-project-tags" name="tags" value={editingProject.tags as string} onChange={handleEditProjectChange} placeholder="tag1, tag2, tag3" rows={2}/></div> <div><Label htmlFor="edit-project-images">Image URLs (comma-separated)</Label><Textarea id="edit-project-images" name="image_urls" value={editingProject.image_urls as string} onChange={handleEditProjectChange} placeholder="/img1.jpg, /img2.png" rows={3}/></div> </div>
                             <DialogFooter className="md:col-span-2 pt-4"> <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose> <Button type="submit"><Save className="mr-2 h-4 w-4"/> Save Changes</Button> </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
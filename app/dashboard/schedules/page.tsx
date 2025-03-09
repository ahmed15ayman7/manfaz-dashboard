import React from 'react'

const page = () => {
    return (
        <div>page</div>
    )
}

export default page
// 'use client';

// import { useState } from 'react';
// import {
//     Box,
//     Paper,
//     Typography,
//     Button,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     IconButton,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     TextField,
//     FormControl,
//     InputLabel,
//     Select,
//     MenuItem,
//     Chip,
//     Grid,
//     Alert,
//     Pagination,
//     Stack,
//     Tab,
//     Tabs,
//     Skeleton,
//     Link,
// } from '@mui/material';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import axios from 'axios';
// import API_ENDPOINTS from '@/lib/apis';
// import { Schedule } from '@/interfaces';
// import { format } from 'date-fns';
// import { PDFDocument } from '@/components/shared/pdf-document';
// import { AnimatePresence } from 'framer-motion';
// import { PermissionGuard } from '@/components/common/PermissionGuard';
// import { motion } from 'framer-motion';
// import { Calendar } from '@mui/x-date-pickers/Calendar';
// import { Transition } from "@headlessui/react"
// import { formatDate } from '@/lib/utils'
// export default function SchedulesPage() {
//     let [page, setPage] = useState(1);
//     let [search, setSearch] = useState('');
//     let [openDialog, setOpenDialog] = useState(false);
//     let [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
//     let [openPrintDialog, setOpenPrintDialog] = useState(false);
//     let [openActivityDialog, setOpenActivityDialog] = useState(false);
//     let [openPermissionsDialog, setOpenPermissionsDialog] = useState(false); 


//     const queryClient = useQueryClient();

//     const { data: schedules, isLoading } = useQuery({
//         queryKey: ['schedules', page, search],
//         queryFn: () => API_ENDPOINTS.workerSchedules.getAll({ page, search }),
//     });
//     const addMutation = useMutation({
//         mutationFn: async (schedule: Schedule) => {
//             const response = await axios.post(API_ENDPOINTS.workerSchedules.create({}, {}), schedule);
//             return response.data.data;
//         },
//     });
//     const updateMutation = useMutation({
//         mutationFn: async (schedule: Schedule) => {
//             const response = await axios.put(API_ENDPOINTS.workerSchedules.update(schedule.id, schedule, {}), schedule);
//             return response.data.data;
//         },
//     });
//     const deleteMutation = useMutation({
//         mutationFn: async (id: string) => {
//             const response = await axios.delete(API_ENDPOINTS.workerSchedules.delete(id, {}), {});
//             return response.data.data;
//         },
//     });


//     if (isLoading) {
//         return (
//             <Box>
//                 <Box sx={{ mb: 4 }}>
//                     <Skeleton variant="text" width={200} height={40} />
//                 </Box>
//                 <Grid container spacing={3} mb={4}>
//                     {[...Array(4)].map((_, index) => (
//                         <Grid item xs={12} md={3} key={index}>
//                             <Skeleton variant="rectangular" height={100} />
//                         </Grid>
//                     ))}
//                 </Grid>
//                 <Skeleton variant="rectangular" height={400} />
//             </Box>
//         )
//     }
//     const handleOpenDialog = (schedule?: Schedule) => {
//         if (schedule) {
//             setSelectedSchedule(schedule);
//             setOpenDialog(true);
//         } else {
//             setSelectedSchedule(null);
//             setOpenDialog(true);
//         }
//     }
//     const handleCloseDialog = () => {
//         setOpenDialog(false);
//         setSelectedSchedule(null);
//     }
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (selectedSchedule) {
//             await updateMutation.mutateAsync(selectedSchedule);
//         } else {
//             await addMutation.mutateAsync(selectedSchedule!);
//         }
//     }
//     const handleDelete = async (id: string) => {
//         await deleteMutation.mutateAsync(id);
//     }
//     return (
//         <PermissionGuard requiredPermissions={['viewSchedules']}>
//             <Box>
//                 <Box sx={{ mb: 4 }}>
//                     <Typography variant="h4">جدول العمال</Typography>
//                 </Box>
//                 <div className="container mx-auto p-4">
//                     <motion.h1
//                         initial={{ opacity: 0, y: -20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="text-2xl font-bold mb-6"
//                     >

//                     </motion.h1>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         {/* Calendar */}
//                         <motion.div
//                             initial={{ opacity: 0, scale: 0.95 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             transition={{ duration: 0.3 }}
//                             className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
//                         >
//                             <Calendar
//                                 mode="single"
//                                 selected={selectedDate}
//                                 onSelect={(date) => {
//                                     if (date) {
//                                         setSelectedDate(date)
//                                         handleDayClick(date)
//                                     }
//                                 }}
//                                 modifiers={{
//                                     hasOrders: (date) => {
//                                         const stats = getDayStats(date)
//                                         return stats.total > 0
//                                     }
//                                 }}
//                                 modifiersStyles={{
//                                     hasOrders: {
//                                         position: 'relative'
//                                     }
//                                 }}
//                                 components={{
//                                     DayContent: ({ date }) => {
//                                         const stats = getDayStats(date)
//                                         return (
//                                             <div className="relative w-full h-full">
//                                                 <div>{date.getDate()}</div>
//                                                 {stats.total > 0 && (
//                                                     <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1">
//                                                         <AnimatePresence>
//                                                             {stats.completed > 0 && (
//                                                                 <motion.span
//                                                                     initial={{ scale: 0 }}
//                                                                     animate={{ scale: 1 }}
//                                                                     exit={{ scale: 0 }}
//                                                                     className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
//                                                                 />
//                                                             )}
//                                                             {stats.in_progress > 0 && (
//                                                                 <motion.span
//                                                                     initial={{ scale: 0 }}
//                                                                     animate={{ scale: 1 }}
//                                                                     exit={{ scale: 0 }}
//                                                                     className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
//                                                                 />
//                                                             )}
//                                                             {stats.pending > 0 && (
//                                                                 <motion.span
//                                                                     initial={{ scale: 0 }}
//                                                                     animate={{ scale: 1 }}
//                                                                     exit={{ scale: 0 }}
//                                                                     className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"
//                                                                 />
//                                                             )}
//                                                             {stats.canceled > 0 && (
//                                                                 <motion.span
//                                                                     initial={{ scale: 0 }}
//                                                                     animate={{ scale: 1 }}
//                                                                     exit={{ scale: 0 }}
//                                                                     className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
//                                                                 />
//                                                             )}
//                                                         </AnimatePresence>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )
//                                     }
//                                 }}
//                                 className="rounded-md"
//                             />
//                         </motion.div>

//                         {/* إحصائيات اليوم المحدد */}
//                         <motion.div
//                             initial={{ opacity: 0, x: 20 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ duration: 0.3, delay: 0.2 }}
//                             className="md:col-span-2"
//                         >
//                             <h2 className="text-lg font-semibold mb-4">
//                                 {t('schedule_for')} {formatDate(selectedDate, locale)}
//                             </h2>
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                                 <motion.div
//                                     whileHover={{ scale: 1.05 }}
//                                     className="bg-white p-4 rounded-lg shadow-sm"
//                                 >
//                                     <div className="text-sm text-gray-500">{t('total_orders')}</div>
//                                     <div className="text-2xl font-bold">{getDayStats(selectedDate).total}</div>
//                                 </motion.div>
//                                 <motion.div
//                                     whileHover={{ scale: 1.05 }}
//                                     className="bg-white p-4 rounded-lg shadow-sm"
//                                 >
//                                     <div className="text-sm text-green-500">{t('completed_orders')}</div>
//                                     <div className="text-2xl font-bold">{getDayStats(selectedDate).completed}</div>
//                                 </motion.div>
//                                 <motion.div
//                                     whileHover={{ scale: 1.05 }}
//                                     className="bg-white p-4 rounded-lg shadow-sm"
//                                 >
//                                     <div className="text-sm text-blue-500">{t('in_progress_orders')}</div>
//                                     <div className="text-2xl font-bold">{getDayStats(selectedDate).in_progress}</div>
//                                 </motion.div>
//                                 <motion.div
//                                     whileHover={{ scale: 1.05 }}
//                                     className="bg-white p-4 rounded-lg shadow-sm"
//                                 >
//                                     <div className="text-sm text-yellow-500">{t('pending_orders')}</div>
//                                     <div className="text-2xl font-bold">{getDayStats(selectedDate).pending}</div>
//                                 </motion.div>
//                             </div>
//                         </motion.div>
//                     </div>

//                     {/* Dialog لعرض طلبات اليوم */}
//                     <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
//                         <Transition
//                             show={isDialogOpen}
//                             enter="transition duration-100 ease-out"
//                             enterFrom="transform scale-95 opacity-0"
//                             enterTo="transform scale-100 opacity-100"
//                             leave="transition duration-75 ease-out"
//                             leaveFrom="transform scale-100 opacity-100"
//                             leaveTo="transform scale-95 opacity-0"
//                         >
//                             <DialogContent className="max-w-4xl">
//                                 <DialogTitle className="text-xl font-semibold">
//                                     {t('orders_for_date')} {formatDate(selectedDate, locale)}
//                                 </DialogTitle>
//                                 <motion.div
//                                     initial={{ opacity: 0 }}
//                                     animate={{ opacity: 1 }}
//                                     transition={{ duration: 0.3 }}
//                                     className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
//                                 >
//                                     <AnimatePresence>
//                                         {selectedDayOrders.map((order, index) => (
//                                             <motion.div
//                                                 key={order.id}
//                                                 initial={{ opacity: 0, y: 20 }}
//                                                 animate={{ opacity: 1, y: 0 }}
//                                                 exit={{ opacity: 0, y: -20 }}
//                                                 transition={{ duration: 0.3, delay: index * 0.1 }}
//                                             >
//                                                 <Link
//                                                     href={`/worker/orders/${order.id}`}
//                                                     className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1"
//                                                 >
//                                                     <div className="flex justify-between items-start">
//                                                         <div>
//                                                             <h3 className="font-medium">{order.service?.name}</h3>
//                                                             <p className="text-sm text-gray-500">{order.user?.name}</p>
//                                                             <p className="text-sm text-gray-500">
//                                                                 {new Date(order.scheduleOrder?.schedule.scheduledTime || '').toLocaleTimeString(locale)}
//                                                             </p>
//                                                         </div>
//                                                         <span
//                                                             className={`inline-block px-2 py-1 rounded-full text-xs ${order.status === 'completed'
//                                                                     ? 'bg-green-100 text-green-800'
//                                                                     : order.status === 'canceled'
//                                                                         ? 'bg-red-100 text-red-800'
//                                                                         : order.status === 'in_progress'
//                                                                             ? 'bg-blue-100 text-blue-800'
//                                                                             : 'bg-yellow-100 text-yellow-800'
//                                                                 }`}
//                                                         >
//                                                             {t(`status.${order.status}`)}
//                                                         </span>
//                                                     </div>
//                                                     {order.notes && (
//                                                         <p className="text-sm text-gray-600 mt-2 line-clamp-2">
//                                                             {order.notes}
//                                                         </p>
//                                                     )}
//                                                     {order.status === 'pending' && (
//                                                         <div className="flex gap-2 mt-3">
//                                                             <motion.button
//                                                                 whileHover={{ scale: 1.05 }}
//                                                                 whileTap={{ scale: 0.95 }}
//                                                                 onClick={(e) => {
//                                                                     e.preventDefault()
//                                                                     handleAcceptOrder(order.id)
//                                                                 }}
//                                                                 className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
//                                                             >
//                                                                 {t('accept')}
//                                                             </motion.button>
//                                                             <motion.button
//                                                                 whileHover={{ scale: 1.05 }}
//                                                                 whileTap={{ scale: 0.95 }}
//                                                                 onClick={(e) => {
//                                                                     e.preventDefault()
//                                                                     handleRejectOrder(order.id)
//                                                                 }}
//                                                                 className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
//                                                             >
//                                                                 {t('reject')}
//                                                             </motion.button>
//                                                         </div>
//                                                     )}
//                                                 </Link>
//                                             </motion.div>
//                                         ))}
//                                     </AnimatePresence>
//                                 </motion.div>
//                             </DialogContent>
//                         </Transition>
//                     </Dialog>
//                 </div>
//             </Box>
//         </PermissionGuard>
//     )


// }
export default function Loading() {
     return (
       <div className="container mx-auto px-4 py-8">
         <div className="flex justify-between items-center mb-8">
           <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
           <div className="h-12 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="bg-glass rounded-[30px] p-6 shadow-lg">
               <div className="h-[250px] w-full bg-gray-200 rounded-[20px] animate-pulse mb-5"></div>
               <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
               <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse mb-4"></div>
               <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-4"></div>
               <div className="flex gap-3">
                 <div className="flex-1 h-10 bg-gray-200 rounded-[30px] animate-pulse"></div>
                 <div className="flex-1 h-10 bg-gray-200 rounded-[30px] animate-pulse"></div>
               </div>
             </div>
           ))}
         </div>
       </div>
     )
   }
import React from "react";
export default function Footer(){
    return(
        <footer className="bg-primary text-secondary py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">دوباميكافين</h3>
              <p className="text-secondary">نقدم لكم أجود أنواع القهوة والبن</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-secondary hover:text-white">الرئيسية</a></li>
                <li><a href="#" className="text-secondary hover:text-white">المتجر</a></li>
                <li><a href="#" className="text-secondary hover:text-white">من نحن</a></li>
                <li><a href="#" className="text-secondary hover:text-white">اتصل بنا</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
              <ul className="space-y-2">
                <li className="text-secondary">الرياض، المملكة العربية السعودية</li>
                <li className="text-secondary">هاتف: 966-XX-XXXXXXX</li>
                <li className="text-secondary">البريد: info@dopamicaffeine.com</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">تابعنا</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-secondary hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-secondary">© 2025 دوباميكافين. جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    );
}
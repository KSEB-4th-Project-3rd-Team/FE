// 거래처 관련 타입 정의
export interface Company {
  id: string
  code: string
  name: string
  representative: string
  phone: string
  email: string
  address: string
  notes: string
  createdAt: string
}

// 로컬 스토리지 키
const COMPANIES_KEY = "wms_companies"

// 거래처 데이터 관리 함수들
export const companyService = {
  // 모든 거래처 가져오기
  getCompanies(): Company[] {
    const companies = localStorage.getItem(COMPANIES_KEY)
    return companies ? JSON.parse(companies) : []
  },

  // 거래처 저장
  saveCompanies(companies: Company[]) {
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies))
  },

  // 거래처 추가
  addCompany(company: Omit<Company, "id" | "createdAt">): Company {
    const companies = this.getCompanies()
    const newCompany: Company = {
      ...company,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    companies.push(newCompany)
    this.saveCompanies(companies)
    return newCompany
  },

  // 거래처 수정
  updateCompany(id: string, company: Partial<Company>) {
    const companies = this.getCompanies()
    const index = companies.findIndex((c) => c.id === id)
    if (index !== -1) {
      companies[index] = { ...companies[index], ...company }
      this.saveCompanies(companies)
    }
  },

  // 거래처 삭제
  deleteCompany(id: string) {
    const companies = this.getCompanies()
    const filteredCompanies = companies.filter((company) => company.id !== id)
    this.saveCompanies(filteredCompanies)
  },
}

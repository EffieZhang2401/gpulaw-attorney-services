import { PrismaClient, LegalCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Seed legal categories with subcategories
  const categories = [
    {
      key: 'FAMILY_LAW' as LegalCategory,
      nameEn: 'Family Law',
      nameZhCn: '家庭法',
      nameZhTw: '家庭法',
      descEn: 'Divorce, child custody, child support, alimony, adoption, and domestic violence protection',
      descZhCn: '离婚、子女监护权、子女抚养费、赡养费、收养和家庭暴力保护',
      descZhTw: '離婚、子女監護權、子女撫養費、贍養費、收養和家庭暴力保護',
      icon: '👨‍👩‍👧‍👦',
      order: 1,
      subcategories: {
        create: [
          { nameEn: 'Divorce', nameZhCn: '离婚', nameZhTw: '離婚', order: 1 },
          { nameEn: 'Child Custody', nameZhCn: '子女监护权', nameZhTw: '子女監護權', order: 2 },
          { nameEn: 'Child Support', nameZhCn: '子女抚养费', nameZhTw: '子女撫養費', order: 3 },
          { nameEn: 'Alimony', nameZhCn: '赡养费', nameZhTw: '贍養費', order: 4 },
          { nameEn: 'Adoption', nameZhCn: '收养', nameZhTw: '收養', order: 5 },
          { nameEn: 'Domestic Violence', nameZhCn: '家庭暴力', nameZhTw: '家庭暴力', order: 6 },
        ]
      }
    },
    {
      key: 'CONSUMER_DEBT' as LegalCategory,
      nameEn: 'Consumer & Debt',
      nameZhCn: '消费者与债务',
      nameZhTw: '消費者與債務',
      descEn: 'Credit card debt collection, car repossession, payday loans, bankruptcy, credit reporting errors, and identity theft',
      descZhCn: '信用卡债务追收、汽车收回、发薪日贷款、破产、信用报告错误和身份盗窃',
      descZhTw: '信用卡債務追收、汽車收回、發薪日貸款、破產、信用報告錯誤和身份盜竊',
      icon: '💳',
      order: 2,
      subcategories: {
        create: [
          { nameEn: 'Credit Card Debt', nameZhCn: '信用卡债务', nameZhTw: '信用卡債務', order: 1 },
          { nameEn: 'Car Repossession', nameZhCn: '汽车收回', nameZhTw: '汽車收回', order: 2 },
          { nameEn: 'Payday Loans', nameZhCn: '发薪日贷款', nameZhTw: '發薪日貸款', order: 3 },
          { nameEn: 'Bankruptcy', nameZhCn: '破产', nameZhTw: '破產', order: 4 },
          { nameEn: 'Credit Reporting Errors', nameZhCn: '信用报告错误', nameZhTw: '信用報告錯誤', order: 5 },
          { nameEn: 'Identity Theft', nameZhCn: '身份盗窃', nameZhTw: '身份盜竊', order: 6 },
        ]
      }
    },
    {
      key: 'HOUSING_LANDLORD' as LegalCategory,
      nameEn: 'Housing & Landlord-Tenant',
      nameZhCn: '住房与房东租客',
      nameZhTw: '住房與房東租客',
      descEn: 'Evictions, rent increases, security deposit disputes, and unsafe housing conditions',
      descZhCn: '驱逐、租金上涨、押金纠纷和不安全的住房条件',
      descZhTw: '驅逐、租金上漲、押金糾紛和不安全的住房條件',
      icon: '🏠',
      order: 3,
      subcategories: {
        create: [
          { nameEn: 'Evictions', nameZhCn: '驱逐', nameZhTw: '驅逐', order: 1 },
          { nameEn: 'Rent Increases', nameZhCn: '租金上涨', nameZhTw: '租金上漲', order: 2 },
          { nameEn: 'Security Deposit Disputes', nameZhCn: '押金纠纷', nameZhTw: '押金糾紛', order: 3 },
          { nameEn: 'Unsafe Housing Conditions', nameZhCn: '不安全的住房条件', nameZhTw: '不安全的住房條件', order: 4 },
        ]
      }
    },
    {
      key: 'WILLS_ESTATES' as LegalCategory,
      nameEn: 'Wills, Estates & Probate',
      nameZhCn: '遗嘱、遗产与遗嘱认证',
      nameZhTw: '遺囑、遺產與遺囑認證',
      descEn: 'Writing wills, setting up trusts, power of attorney, and estate administration after death',
      descZhCn: '撰写遗嘱、设立信托、授权书和死后遗产管理',
      descZhTw: '撰寫遺囑、設立信託、授權書和死後遺產管理',
      icon: '📜',
      order: 4,
      subcategories: {
        create: [
          { nameEn: 'Writing Wills', nameZhCn: '撰写遗嘱', nameZhTw: '撰寫遺囑', order: 1 },
          { nameEn: 'Setting Up Trusts', nameZhCn: '设立信托', nameZhTw: '設立信託', order: 2 },
          { nameEn: 'Power of Attorney', nameZhCn: '授权书', nameZhTw: '授權書', order: 3 },
          { nameEn: 'Estate Administration', nameZhCn: '遗产管理', nameZhTw: '遺產管理', order: 4 },
        ]
      }
    },
    {
      key: 'IMMIGRATION' as LegalCategory,
      nameEn: 'Immigration',
      nameZhCn: '移民',
      nameZhTw: '移民',
      descEn: 'Green card applications, asylum, citizenship (naturalization), deportation defense, and work visas',
      descZhCn: '绿卡申请、庇护、公民身份（入籍）、驱逐辩护和工作签证',
      descZhTw: '綠卡申請、庇護、公民身份（入籍）、驅逐辯護和工作簽證',
      icon: '✈️',
      order: 5,
      subcategories: {
        create: [
          { nameEn: 'Green Card Applications', nameZhCn: '绿卡申请', nameZhTw: '綠卡申請', order: 1 },
          { nameEn: 'Asylum', nameZhCn: '庇护', nameZhTw: '庇護', order: 2 },
          { nameEn: 'Citizenship (Naturalization)', nameZhCn: '公民身份（入籍）', nameZhTw: '公民身份（入籍）', order: 3 },
          { nameEn: 'Deportation Defense', nameZhCn: '驱逐辩护', nameZhTw: '驅逐辯護', order: 4 },
          { nameEn: 'Work Visas', nameZhCn: '工作签证', nameZhTw: '工作簽證', order: 5 },
        ]
      }
    },
    {
      key: 'CRYPTO_COMPLIANCE' as LegalCategory,
      nameEn: 'Crypto Compliance',
      nameZhCn: '加密货币合规',
      nameZhTw: '加密貨幣合規',
      descEn: 'Cryptocurrency regulations, exchange compliance, ICO legal opinions, AML/KYC requirements, and token classification',
      descZhCn: '加密货币法规、交易所合规、ICO法律意见、AML/KYC要求和代币分类',
      descZhTw: '加密貨幣法規、交易所合規、ICO法律意見、AML/KYC要求和代幣分類',
      icon: '₿',
      order: 6,
      subcategories: {
        create: [
          { nameEn: 'Cryptocurrency Regulations', nameZhCn: '加密货币法规', nameZhTw: '加密貨幣法規', order: 1 },
          { nameEn: 'Exchange Compliance', nameZhCn: '交易所合规', nameZhTw: '交易所合規', order: 2 },
          { nameEn: 'ICO Legal Opinions', nameZhCn: 'ICO法律意见', nameZhTw: 'ICO法律意見', order: 3 },
          { nameEn: 'AML/KYC Requirements', nameZhCn: 'AML/KYC要求', nameZhTw: 'AML/KYC要求', order: 4 },
          { nameEn: 'Token Classification', nameZhCn: '代币分类', nameZhTw: '代幣分類', order: 5 },
        ]
      }
    },
  ]

  // Create or update categories
  for (const category of categories) {
    const result = await prisma.category.upsert({
      where: { key: category.key },
      update: {},
      create: category,
    })
    console.log(`✅ Created category: ${result.nameEn} (${result.key})`)
  }

  console.log('')
  console.log('🎉 Database seeding completed successfully!')
  console.log('📊 Summary:')
  console.log(`   - ${categories.length} legal categories created`)
  console.log(`   - ${categories.reduce((sum, cat) => sum + cat.subcategories.create.length, 0)} subcategories created`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during database seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
